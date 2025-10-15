using ifm3bAPI.Data;
using ifm3bAPI.Models;
using ifm3bAPI.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ifm3bAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StocksController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public StocksController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public async Task<IActionResult> GetStocks()
        {
            try
            {
                var stockList = await dbContext.Stocks.ToListAsync();
                return Ok(stockList);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace }); 
            }
        }

        //getting stock by id
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStockById(string id)
        {
            var stockId = await dbContext.Stocks.FindAsync(id);
            if (stockId == null)
            {
                return NotFound(new {message = "Stock name was not found"});
            }

            return Ok(stockId);
        }

        //getting stock by id from TempStockSelection
        [HttpGet("tempStock/{id:Guid}")]
        public async Task<IActionResult> GetTempStockById(Guid id)
        {
            try { 
            var stockId = await dbContext.TempStockSelections.FindAsync(id);
            if (stockId == null)
            {
                return NotFound(new { message = "Stock temp name was not found" });
            }

            return Ok(stockId);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace}); 
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddStock([FromBody] StockDto stockDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // check if stock exists
            if (await dbContext.Stocks.AnyAsync(s => s.StockId == stockDto.StockId))
            {
                return Conflict("Stock name already exists.");
            }
            
            var newStock = new Stock
            {
                StockId = stockDto.StockId,
                StockAvailable = stockDto.StockAvailable,
                EstimatedFull = stockDto.EstimatedFull,
                StockReport = stockDto.StockReport
            };

            dbContext.Stocks.Add(newStock);
            await dbContext.SaveChangesAsync();

            return Ok(newStock);
        }

        //Add a stock selection to staging TempStockSelection
        [HttpPost("staging/{bookingId}")]
        public async Task<IActionResult> AddToStaging(Guid bookingId, [FromBody] StagingDto Dto)
        {
            var stock = await dbContext.Stocks.FindAsync(Dto.StockId);
            
            if (stock == null)
            {
                return NotFound("Stock not found");
            }

            if (Dto.Quantity < 0)
            {
                return BadRequest("Quantity must be >= 0");
            }

            //check available stock number
            int availableStk = stock.StockAvailable;
            if (Dto.Quantity > availableStk)
            {
                // Cannot fully satisfy
                return BadRequest(new
                {
                    message = "Insufficient stock",
                    available = availableStk,
                    requested = Dto.Quantity
                });
            }

            //reduce the stock immediately so others can't overcommit
            stock.StockAvailable -= Dto.Quantity;

            var staging = new TempStockSelection
            {
                StagingId = Guid.NewGuid(),
                BookingId = bookingId,
                StockId = Dto.StockId,
                Quantity = Dto.Quantity,
                CreatedAt = DateTime.UtcNow,
                UserId = Dto.UserId
            };
            dbContext.TempStockSelections.Add(staging);

            await dbContext.SaveChangesAsync();
            return Ok(staging);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStock(string id, [FromBody] StockDto stockDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != stockDto.StockId)
            {
                return BadRequest("StockId in URL must match StockId in body");
            }

            var stock = await dbContext.Stocks.FindAsync(id);
            if (stock == null)
            {
                return NotFound("Stock name not found");
            }

            // update fields
            stock.StockAvailable = stockDto.StockAvailable;
            stock.EstimatedFull = stockDto.EstimatedFull;
            stock.StockReport = stockDto.StockReport;

            dbContext.Stocks.Update(stock);
            await dbContext.SaveChangesAsync();

            return Ok(stock);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStock(string id)
        {
            var stock = await dbContext.Stocks.FindAsync(id);
            if (stock == null)
            {
                return NotFound("Stock name not found");
            }

            dbContext.Stocks.Remove(stock);
            await dbContext.SaveChangesAsync();
            return Ok("Successfully deleted stock");
        }

        //Remove a staging item(stock) on TempStockSelections
        [HttpDelete("staging/{stagingId}")]
        public async Task<IActionResult> RemoveStaging(Guid stagingId)
        {
            var tempStock = await dbContext.TempStockSelections.FindAsync(stagingId);
            if (tempStock == null)
            {
                return NotFound("Stock temp name not found");
            }

            // Return the stock back
            var stock = await dbContext.Stocks.FindAsync(tempStock.StockId);
            if (stock != null)
            {
                stock.StockAvailable += tempStock.Quantity;
            }

            dbContext.TempStockSelections.Remove(tempStock);
            await dbContext.SaveChangesAsync();
            return Ok();
        }

        //submit the staging into Bookings + Stocks
        [HttpPost("submit/{bookingId}")]
        public async Task<IActionResult> Submit(Guid bookingId)
        {
            // Entire operation in a transaction
            using var tx = await dbContext.Database.BeginTransactionAsync();
            try
            {
                var booking = await dbContext.Bookings.FindAsync(bookingId);
                if (booking == null)
                {
                    return NotFound("Booking not found");
                }

                var stagedStock = await dbContext.TempStockSelections.Where(s => s.BookingId == bookingId).ToListAsync();

                if (!stagedStock.Any())
                {
                    return BadRequest("No stock items selected");
                }

                //we already deducted stock when adding stock on TempStockSelected on AddToStaging. But we should double check for safety.
                var fulfilledParts = new List<string>();
                var unfulfilledParts = new List<string>();

                foreach (var st in stagedStock)
                {
                    var stock = await dbContext.Stocks.FindAsync(st.StockId);
                    if (stock == null)
                    {
                        //Should not happen, but treat as unfulfilled
                        unfulfilledParts.Add($"{st.StockId}/{st.Quantity}");
                        continue;
                    }

                    //check If Stock Available is negative 
                    if (stock.StockAvailable < 0)
                    {
                        //Treat entire st as unfulfilled
                        unfulfilledParts.Add($"{st.StockId}/{st.Quantity}");
                    }
                    else
                    {
                        //Assume st.Quantity was already reserved/deducted; so it's fulfilled
                        fulfilledParts.Add($"{st.StockId}/{st.Quantity}");
                    }

                    //check If stock report is null
                    if (stock.StockReport == null)
                    {
                        stock.StockReport = "";
                    }

                    // If unfulfilled, add to report
                    if (unfulfilledParts.Any(u => u.StartsWith(st.StockId + "/")))
                    {
                        int qty = st.Quantity;
                        stock.StockReport = AppendReport(stock.StockReport, st.StockId, qty);
                    }
                }

                // Update booking fields
                booking.Stock = string.Join(',', fulfilledParts);
                booking.NewStock = string.Join(',', unfulfilledParts);

                // Remove staging items
                dbContext.TempStockSelections.RemoveRange(stagedStock);

                await dbContext.SaveChangesAsync();
                await tx.CommitAsync();
                return Ok(booking);
            }
            catch (Exception ex)
            {
                await tx.RollbackAsync();
                return StatusCode(500, "Error submitting stock: " + ex.Message);
            }
        }

        private string AppendReport(string currentReport, string stockId, int qty)
        {
            //currentReport = "S1:3,S2:5", we want to add qty to existing
            var parts = new Dictionary<string, int>();
            if (!string.IsNullOrEmpty(currentReport))
            {
                foreach (var part in currentReport.Split(','))
                {
                    var bits = part.Split(':');
                    if (bits.Length == 2 && int.TryParse(bits[1], out int existing))
                    {
                        parts[bits[0]] = existing;
                    }
                }
            }
            if (!parts.ContainsKey(stockId))
            {
                parts[stockId] = 0;
            }

            parts[stockId] += qty;
            return string.Join(",", parts.Select(kv => $"{kv.Key}:{kv.Value}"));
        }
        
        //canceling 
        [HttpDelete("cancel/{bookingId}")]
        public async Task<IActionResult> CancelBookingStock(Guid bookingId)
        {
            var selections = await dbContext.TempStockSelections
                .Where(x => x.BookingId == bookingId)
                .ToListAsync();

            foreach (var item in selections)
            {
                var stock = await dbContext.Stocks.FindAsync(item.StockId);
                if (stock != null)
                {
                    stock.StockAvailable += item.Quantity;
                }
            }

            dbContext.TempStockSelections.RemoveRange(selections);
            await dbContext.SaveChangesAsync();

            return Ok("Cancelled and stock restored");
        }

    }
}

