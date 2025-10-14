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

        //booking room search
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

            //check the room fetched if there are available or not to be booked
            var roomStatusCheck = roomfetched
                    .Where(rm => rm.Status == "Available") 
                    .ToList();

            //filter out rooms already booked
            var availableRooms = roomStatusCheck
                    .Where(rm => 
                        !dbContext.Bookings.Any(b => b.RoomId == rm.RoomId &&
                            b.Status != "Closed" && //Available rooms not included
                            !(roomSearchDto.SesionEnd <= b.Sesion_Start || roomSearchDto.SesionStart >= b.Sesion_End)
                        ) &&
                        !dbContext.BookingTemps.Any(bTemp => bTemp.RoomId == rm.RoomId &&
                            !(roomSearchDto.SesionEnd <= bTemp.Sesion_Start || roomSearchDto.SesionStart>= bTemp.Sesion_End)
                    
                        )
                    )
                    .ToList();

            return Ok( availableRooms );
        }

        //add booking to temp
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
        public async Task<IActionResult> DeleteTempById(int id)
        {
            var bookTemp = await dbContext.BookingTemps.FindAsync(id);
           
            if (bookTemp is null)
            {
                return NotFound(new { meassage = "The user was not found" });
            }

            dbContext.BookingTemps.Remove(bookTemp);
            await dbContext.SaveChangesAsync();
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

        //get bookings with id 
        [HttpGet]
        [Route("{id:Guid}")]
        public async Task<IActionResult> GetBookingsById(Guid id)
        {
            try
            {
                var book = await dbContext.Bookings.FindAsync(id);
                if (book is null)
                {
                    return NotFound(new { message = "No booking was found" });//404 result
                }
                return Ok(book);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while getting all bookings: {ex.Message}");
            }
        }

        //Update booking status and statusInfo 
        [HttpPut("status/{id:Guid}")]
        public async Task<IActionResult> UpdateBookingStatus(Guid id, [FromBody] BookingStatusUpdateDto bookingStatusUpdateDto)
        {
            var booking = await dbContext.Bookings.FindAsync(id);
            
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found" });
            }
            
            booking.Status = bookingStatusUpdateDto.Status;
            booking.StatusInfo = bookingStatusUpdateDto.StatusInfo;
            
            dbContext.Bookings.Update(booking);
            await dbContext.SaveChangesAsync();
            
            return Ok(new { message = "Status updated successfully" });
        }

        //update booking by employee
        [HttpPut("empUdateBooking/{id}")]
        public async Task<IActionResult> UpdateBooking(Guid id, [FromBody] RoomSearchDto updatedBooking)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var booking = await dbContext.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found" });
            }

            // Fetch the associated room
            var room = await dbContext.Rooms.FirstOrDefaultAsync(r => r.RoomId == booking.RoomId);
            if (room == null)
            {
                return NotFound(new { message = "Associated room not found." });
            }

            // Check capacity does not exceed room capacity
            if (updatedBooking.Capacity > room.Capacity)
            {
                return BadRequest(new { message = $"Capacity cannot exceed the room limit of {room.Capacity}." });
            }

            // Update selected fields
            booking.Sesion_Start = updatedBooking.SesionStart;
            booking.Sesion_End = updatedBooking.SesionEnd;
            booking.Capacity = updatedBooking.Capacity;
            booking.Amenities = string.Join(", ", updatedBooking.Amenities);

            await dbContext.SaveChangesAsync();

            return Ok(new { message = "Booking updated successfully", booking });
        }

        //getting amenities for room
        [HttpGet("roomAmenities/{roomId}")]
        public async Task<IActionResult> GetRoomAmenities(string roomId)
        {
            var room = await dbContext.Rooms.FindAsync(roomId);
            if (room == null)
            {
                return NotFound(new { message = "Room not found." });
            }

            var amenities = (room.Amenities ?? "")
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .ToList();

            return Ok(amenities);
        }

        //update room search
        [HttpPost("Updatesearchavailable")]
        public IActionResult UpdateSearchRoomsAvailable([FromBody] UpdateEmpBooking updateEmpBooking)
        {
            try
            {
                if (updateEmpBooking.SesionStart >= updateEmpBooking.SesionEnd)
                {
                    return BadRequest(new { message = "End time must be after start time." });
                }

                //Check if room exists and is available
                var room = dbContext.Rooms.FirstOrDefault(r => r.RoomId == updateEmpBooking.RoomId);
                if (room == null)
                {
                    return NotFound(new { message = "Room not found." });
                }

                if (room.Status != "Available")
                {
                    return BadRequest(new { message = "Room is currently not available." });
                }

                //Check for time overlap in Bookings for the same employee
                var employeeConflict = dbContext.Bookings.Where(b =>
                    b.Employee_Number == updateEmpBooking.EmployeeId &&
                    b.Id != updateEmpBooking.BookingGuidToExclude &&
                    b.Status != "Closed" &&
                    updateEmpBooking.SesionStart < b.Sesion_End &&
                    updateEmpBooking.SesionEnd > b.Sesion_Start
                ).ToList();

                if (employeeConflict.Any())
                {
                    Console.WriteLine("Employee has conflicting booking:");
                    foreach (var b in employeeConflict)
                    {
                        Console.WriteLine($"Conflicting Booking Id={b.Id}, Start={b.Sesion_Start}, End={b.Sesion_End}");
                    }

                    return Conflict(new { message = "You already have another booking at this time." });
                }

                //Check for time overlap in Bookings (excluding current booking)
                var hasBookingConflict = dbContext.Bookings.Where(b =>
                    b.RoomId == updateEmpBooking.RoomId &&
                    b.Status != "Closed" &&
                    b.Id != updateEmpBooking.BookingGuidToExclude &&
                    updateEmpBooking.SesionStart < b.Sesion_End &&
                   updateEmpBooking.SesionEnd > b.Sesion_Start
                ).ToList();

                foreach (var b in hasBookingConflict)
                {
                    Console.WriteLine($"Conflict in Booking: Id={b.Id}, Start={b.Sesion_Start:O}, End={b.Sesion_End:O}");
                }

                //Check for time overlap in BookingTemps
                var hasTempConflict = dbContext.BookingTemps.Where(t =>
                    t.RoomId == updateEmpBooking.RoomId &&
                    updateEmpBooking.SesionStart < t.Sesion_End &&
                    updateEmpBooking.SesionEnd > t.Sesion_Start
                ).ToList();

                foreach (var t in hasTempConflict)
                {
                    Console.WriteLine($"Conflict in BookingTemp: Start={t.Sesion_Start:O}, End={t.Sesion_End:O}");
                }

                if (hasBookingConflict.Any() || hasTempConflict.Any())
                {
                    return Conflict(new { message = "Room is already booked during the selected time." });
                }

                Console.WriteLine("=== Overlap Check Input ===");
                Console.WriteLine($"Exclude Booking: {updateEmpBooking.BookingGuidToExclude}");
                Console.WriteLine($"Requested RoomId: {updateEmpBooking.RoomId}");
                Console.WriteLine($"Requested Start: {updateEmpBooking.SesionStart:O}");
                Console.WriteLine($"Requested End: {updateEmpBooking.SesionEnd:O}");

                var conflictingConfirmed = dbContext.Bookings
                    .Where(b => b.RoomId == updateEmpBooking.RoomId && b.Status != "Close" && b.Id != updateEmpBooking.BookingGuidToExclude)
                    .ToList();

                foreach (var b in conflictingConfirmed)
                {
                    Console.WriteLine($"Existing Booking: Id={b.Id}, Start={b.Sesion_Start:O}, End={b.Sesion_End:O}");
                }

                var conflictingTemps = dbContext.BookingTemps
                   .Where(t => t.RoomId == updateEmpBooking.RoomId)
                   .ToList();

                foreach (var t in conflictingTemps)
                {
                    Console.WriteLine($"Existing Temp: Start={t.Sesion_Start:O}, End={t.Sesion_End:O}");
                }

                //Everything is fine
                return Ok(new { message = "Room is available for update." });
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in CheckRoomAvailabilityForUpdate: " + ex);
                return StatusCode(500, new { message = "Internal server error", detail = ex.Message });
            }
        }
    }
}
