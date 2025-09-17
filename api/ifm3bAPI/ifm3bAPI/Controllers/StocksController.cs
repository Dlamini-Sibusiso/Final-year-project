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
                return NotFound();
            }

            dbContext.Stocks.Remove(stock);
            await dbContext.SaveChangesAsync();
            return Ok("Successfully deleted stock");
        }
    }
}
