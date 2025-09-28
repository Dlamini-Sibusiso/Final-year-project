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
    public class BookingsController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public BookingsController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpPost("searchavailable")]
        public IActionResult SearchRoomsAvailable([FromBody] RoomSearchDto roomSearchDto)
        {
            if (roomSearchDto.Amenities == null || roomSearchDto.Amenities.Count == 0)
            {
                return BadRequest(new {message= "Select at least one amenity"});
            }

            if (roomSearchDto.SesionEnd <= roomSearchDto.SesionStart)
            {
                return BadRequest(new { message = "End time must be after start time." });
            }

            var roomfetched = dbContext.Rooms.Where(rm => rm.Capacity >= roomSearchDto.Capacity)//fetch all rooms meeting capacity
                .AsEnumerable() //move to in-memory to allow string split
                .Where(rm => {
                    var roomAmen = rm.Amenities?
                        .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                        .Select(a => a.Trim().ToLower())
                        .ToList() ?? new List<string>();

                    //Normalize incoming search amenities
                    var requiredAmen = roomSearchDto.Amenities
                        .Select(a => a.Trim().ToLower())
                        .ToList();

                    return requiredAmen.All(r => roomAmen.Contains(r));

                })
                .ToList();

                //filter out rooms already booked
                var availableRooms = roomfetched
                    .Where(rm => 
                        !dbContext.Bookings.Any(b => b.RoomId == rm.RoomId &&
                            !(roomSearchDto.SesionEnd <= b.Sesion_Start || roomSearchDto.SesionStart >= b.Sesion_End)
                        ) &&
                        !dbContext.BookingTemps.Any(bTemp => bTemp.RoomId == rm.RoomId &&
                            !(roomSearchDto.SesionEnd <= bTemp.Sesion_Start || roomSearchDto.SesionStart>= bTemp.Sesion_End)
                    
                        )
                    )
                    .ToList();
                
            return Ok( availableRooms );
        }

        [HttpPost("AddTemp")]
        public IActionResult AddBookingTemp([FromBody] BookingRequestDto bookingRequestDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //check for overlap sessions in Bookings
            bool timeOverlap = dbContext.Bookings.Any(b =>
                b.Employee_Number == bookingRequestDto.Employee_Number &&
                !(bookingRequestDto.Sesion_End <= b.Sesion_Start || bookingRequestDto.Sesion_Start >= b.Sesion_End)
            );

            if (timeOverlap)
            {
                return BadRequest(new { message = "You already have a booking at this time. Bookings"});
            }

            //check for overlap sessions in BookingTemps
            bool timeOverlapTemp = dbContext.BookingTemps.Any(bTemp =>
                bTemp.Employee_Number == bookingRequestDto.Employee_Number &&
                !(bookingRequestDto.Sesion_End <= bTemp.Sesion_Start || bookingRequestDto.Sesion_Start >= bTemp.Sesion_End)
            );

            if (timeOverlapTemp)
            { 
                return BadRequest(new { message = "You already have a booking at this time. Booking temp" });
            }

            //Prevent room from being double booked
            bool isRoomBooked = dbContext.Bookings.Any(bk =>
                bk.RoomId == bookingRequestDto.RoomId &&
                !(bookingRequestDto.Sesion_End <= bk.Sesion_Start || bookingRequestDto.Sesion_Start >= bk.Sesion_End)
            ) ||
            dbContext.BookingTemps.Any(bkTemp =>
                 bkTemp.RoomId == bookingRequestDto.RoomId &&
                !(bookingRequestDto.Sesion_End <= bkTemp.Sesion_Start || bookingRequestDto.Sesion_Start >= bkTemp.Sesion_End)
            );

            if (isRoomBooked)
            {
                return BadRequest(new { message = "Room already booked for this times" });
            }
            
            //generate bookingId if not provided
            var bookingId = bookingRequestDto.BookingId ?? UniqueBookingId();

            var Temp = new BookingTemp
            {
                BookingId = bookingId,
                Employee_Number = bookingRequestDto.Employee_Number,
                RoomId = bookingRequestDto.RoomId,
                Sesion_Start = bookingRequestDto.Sesion_Start,
                Sesion_End = bookingRequestDto.Sesion_End,
                Capacity = bookingRequestDto.Capacity,
                Amenities = bookingRequestDto.Amenities,
                Stock = bookingRequestDto.Stock,
                NewStock = bookingRequestDto.NewStock,
                Status = bookingRequestDto.Status,
                StatusInfo = bookingRequestDto.StatusInfo
            };

            dbContext.BookingTemps.Add( Temp );
            dbContext.SaveChanges();

            return Ok(new { message = "Successfully added BookingTemp", BookingId = bookingId });

        }
        
        //unique bookingId
        private string UniqueBookingId()
        {
            string bookingId;

            do
            {
                bookingId = $"BK-{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
            }
            while (//checking BookingId does not exist in bookings or temp
                dbContext.Bookings.Any(b => b.BookingId == bookingId) ||
                dbContext.BookingTemps.Any(b => b.BookingId == bookingId));

            return bookingId;
        }

        //Delete bookingtemp bookings that were not completed
        [HttpDelete]
        [Route("uncompletedTempbookings/{empNumber:int}")]
        public IActionResult DeleteTempBookings(int empNumber)
        {
            var bookTemp = dbContext.BookingTemps.Where(b => b.Employee_Number == empNumber).ToList();

            if (!bookTemp.Any())
            {
                return BadRequest(new { meassage = "No bookings found." });
            }

            dbContext.BookingTemps.RemoveRange(bookTemp);
            dbContext.SaveChanges();
            return Ok(bookTemp);
        }

        //Delete bookingtemp while booking 
        [HttpDelete]
        [Route("TempbyId/{id:int}")]
        public IActionResult DeleteTempById(int id)
        {
            var bookTemp = dbContext.BookingTemps.Find(id);
           
            if (bookTemp is null)
            {
                return NotFound(new { meassage = "The user was not found" });
            }

            dbContext.BookingTemps.Remove(bookTemp);
            dbContext.SaveChanges();
            return Ok(bookTemp);
        }

        //Getting all bookings in temp with an employee number
        [HttpGet("Temp/{id:int}")]
        public IActionResult GetBookTempById(int id)
        {
            var employeeBooking = dbContext.BookingTemps.Where(bt => bt.Employee_Number == id).ToList();
        
            return Ok(employeeBooking);
        }
        
        [HttpPost("ConfirmBooking")]
        public IActionResult ConfirmBooking([FromBody] ConfirmBookingRequestDto confirmBookingDto)
        {
            var bookTemp = dbContext.BookingTemps.Where(b => b.BookingId == confirmBookingDto.BookingId).ToList();

            if (!bookTemp.Any())
            {
                return BadRequest("No bookings found to confirm.");
            }

            var bookings = bookTemp.Select(b => new Booking
            { 
                Id = Guid.NewGuid(),
                BookingId = b.BookingId,
                Employee_Number = b.Employee_Number,
                RoomId = b.RoomId,
                Sesion_Start = b.Sesion_Start,
                Sesion_End = b.Sesion_End,
                Capacity = b.Capacity,
                Amenities = b.Amenities,
                Stock = b.Stock,
                NewStock = b.NewStock,
                Status = b.Status,
                StatusInfo = b.StatusInfo
            }).ToList();

            dbContext.Bookings.AddRange(bookings);
            dbContext.BookingTemps.RemoveRange(bookTemp);
            dbContext.SaveChanges();

            return Ok("Booking confirmed successfully.");
        }

        //get all Bookings 
        [HttpGet]
        public async Task<IActionResult> GetAllBookings()
        {
            try
            {
                var allBookings = await dbContext.Bookings.ToListAsync();
                if (!allBookings.Any()) //check if list is empty
                {
                    return NotFound(new { message = "No Bookings was found" });
                }

                return Ok(allBookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while getting all bookings: {ex.Message}");
            }
        }
    }
}
