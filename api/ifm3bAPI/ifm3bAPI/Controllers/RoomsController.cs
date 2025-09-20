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
    public class RoomsController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;
        private readonly IWebHostEnvironment _env;

        public RoomsController(ApplicationDbContext dbContext, IWebHostEnvironment env)
        {
            this.dbContext = dbContext;
            _env = env;
        }

        //Adding room
        [HttpPost("create")]
        public async Task<IActionResult> UploadRoom([FromForm] UploadRoomDto uploadRoomDto)
        {
            string? imageUrl = null;

            if (uploadRoomDto.Image != null)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
                Directory.CreateDirectory(uploadsFolder);

                var fileName = Guid.NewGuid() + Path.GetExtension(uploadRoomDto.Image.FileName);
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await uploadRoomDto.Image.CopyToAsync(stream);
                }

                imageUrl = $"/uploads/{fileName}";
            }

            var room = new Room
            {
                RoomId = uploadRoomDto.RoomId,
                Description = uploadRoomDto.Description,
                Capacity = uploadRoomDto.Capacity,
                Amenities = uploadRoomDto.Amenities,
                Status = uploadRoomDto.Status,
                Reason = uploadRoomDto.Reason,
                ImageUrl = imageUrl
            };
            
            dbContext.Rooms.Add(room);
            dbContext.SaveChanges();

            return Ok(new { message = "Room successfully added" });
        }

        //api/Rooms getting all available rooms
        [HttpGet]
        public async Task<IActionResult> GetAllRooms()
        {
            var rooms = await dbContext.Rooms.ToListAsync();
            return Ok(rooms);
        }

        //get room with room id 
        [HttpGet]
        [Route("{id}")]
        public async Task<IActionResult> GetRoomById(string id)
        {
            var room = await dbContext.Rooms.FindAsync(id);
            if (room is null)
            {
                return NotFound(new { message = "No room was found" });//404 result
            }
            return Ok(room);
        }

        //Update or Edit room
        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> EditRoom(string id,[FromForm] UploadRoomDto uploadRoomDto)
        {
            //Validating the incoming request body
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //finding room
            var room = await dbContext.Rooms.FindAsync(id);

            if (room is null)
            {
                return NotFound(new { meassage = "The room was not found" });
            }

            room.Description = uploadRoomDto.Description;
            room.Capacity = uploadRoomDto.Capacity;
            room.Amenities = uploadRoomDto.Amenities;
            room.Status = uploadRoomDto.Status;
            room.Reason = string.IsNullOrWhiteSpace(uploadRoomDto.Reason) ? null : uploadRoomDto.Reason;

            //Handle image upload
            if (uploadRoomDto.Image != null)
            {
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(uploadRoomDto.Image.FileName)}";
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");

                if(!Directory.Exists(folderPath))
                {
                    Directory.CreateDirectory(folderPath);
                }

                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await uploadRoomDto.Image.CopyToAsync(stream);
                }

                room.ImageUrl = $"/uploads/{fileName}";
            }

            await dbContext.SaveChangesAsync();//save the changes made to the database
            return Ok(room);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteRoom(string id)
        {
            var room = await dbContext.Rooms.FindAsync(id);
            if (room is null)
            {
                return NotFound(new {message ="Room not found"});
            }

            dbContext.Rooms.Remove(room);
            await dbContext.SaveChangesAsync();

            return Ok(new {message ="Successfully Deleted"});
        }
    }
}
