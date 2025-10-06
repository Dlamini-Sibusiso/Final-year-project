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

                //filter out rooms already booked
                var availableRooms = roomfetched
                    .Where(rm => 
                        !dbContext.Bookings.Any(b => b.RoomId == rm.RoomId &&
                            b.Status != "Close" && //Available rooms not included
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
        public IActionResult UpdateSearchRoomsAvailable([FromBody] RoomSearchDto roomSearchDto)
        {
            try { 
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();

                return BadRequest(new { message = "Invalid input", errors });
            }

                Console.WriteLine("Incoming:", $"Start={roomSearchDto.SesionStart:O}, End={roomSearchDto.SesionEnd:O}, ExcludeId={roomSearchDto.BookingGuidToExclude}");

                if (roomSearchDto.Amenities == null || roomSearchDto.Amenities.Count == 0)
            {
                return BadRequest(new { message = "Select at least one amenity" });
            }

            if (roomSearchDto.SesionEnd <= roomSearchDto.SesionStart)
            {
                return BadRequest(new { message = "End time must be after start time." });
            }

            Console.WriteLine("==== Room Search Triggered ====");
            Console.WriteLine($"Start: {roomSearchDto.SesionStart}");
            Console.WriteLine($"End: {roomSearchDto.SesionEnd}");
            Console.WriteLine($"Capacity: {roomSearchDto.Capacity}");
            Console.WriteLine($"Exclude Booking ID: {roomSearchDto.BookingGuidToExclude}");
            Console.WriteLine("Amenities: " + string.Join(", ", roomSearchDto.Amenities));

                /*var roomfetched = dbContext.Rooms.Where(rm => rm.Capacity >= roomSearchDto.Capacity)//fetch all rooms meeting capacity
                    .AsEnumerable() //move to in-memory to allow string split
                    .Where(rm => {
                        var roomAmen = rm.Amenities?
                            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                            .Select(a => a.Trim().ToLower())
                            .ToList() ?? new List<string>();
                        */
                /*                var potentialConflicts = dbContext.Bookings
                .Where(b => b.RoomId == rm.RoomId && b.Status != "Close")
                .ToList();

                                foreach (var b in potentialConflicts)
                                {
                                    Console.WriteLine($"Check Booking ID: {b.Id}, Start: {b.Sesion_Start:O}, End: {b.Sesion_End:O}");
                                }
            */

                var allBookings = dbContext.Bookings
    .Where(b => b.Status != "Close")
    .ToList();

                foreach (var b in allBookings)
                {
                    Console.WriteLine($"Existing booking: Id={b.Id}, RoomId={b.RoomId}, Start={b.Sesion_Start:O}, End={b.Sesion_End:O}");
                }

                //Normalize incoming search amenities
                var requiredAmen = roomSearchDto.Amenities
                        .Select(a => a.Trim().ToLower())
                        .ToList();

                var sessionStart = roomSearchDto.SesionStart;
                var sessionEnd = roomSearchDto.SesionEnd;
                var excludeId = roomSearchDto.BookingGuidToExclude;

                // Query all rooms with capacity filter only
                var candidateRooms = dbContext.Rooms
                    .Where(r => r.Capacity >= roomSearchDto.Capacity)
                    .ToList();

                //Get all conflicting bookings & temp bookings
                var conflictingRoomIds = dbContext.Bookings
                    .Where(b => b.Status != "Close" &&
                                (!excludeId.HasValue || b.Id != excludeId) &&
                                sessionStart < b.Sesion_End &&
                                sessionEnd > b.Sesion_Start)
                    .Select(b => b.RoomId.Trim())
                    .Union(
                        dbContext.BookingTemps
                            .Where(t => sessionStart < t.Sesion_End &&
                                        sessionEnd > t.Sesion_Start)
                            .Select(t => t.RoomId.Trim().ToLower())
                    )
                    .Distinct()
                    .ToList();

                //Filter based on amenities
                var filteredRooms = candidateRooms
                    .Where(r =>
                    {
                        var roomAmenities = (r.Amenities ?? "")
                            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                            .Select(a => a.Trim().ToLower())
                            .ToList();

                        
                        return requiredAmen.All(req => roomAmenities.Contains(req))
                        && !conflictingRoomIds.Contains(r.RoomId); //overlaping filter

                    })
                    .ToList();

                //Remove conflicting rooms
                var availableRooms = filteredRooms
            .Where(r => !conflictingRoomIds.Contains(r.RoomId.Trim().ToLower()))
            .ToList();

                foreach (var room in availableRooms)
                {
                    Console.WriteLine($"Available Room: {room.RoomId}");
                }

                Console.WriteLine($"Available rooms: {availableRooms.Count}");
            return Ok(availableRooms);

        }
    catch (Exception ex)
    {
        Console.WriteLine("Exception in Updatesearchavailable: " + ex.ToString());
        return StatusCode(500, new { message = "Internal server error", detail = ex.Message
    });
    }
        }
    }
}
