using ifm3bAPI.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ifm3bAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public ReportsController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        //most used rooms
        [HttpGet("MostUsedRooms")]
        public async Task<IActionResult> GetMostUsedRooms()
        {
            var result = await dbContext.Bookings
                .GroupBy(b => b.RoomId)
                .Select(g => new { RoomId = g.Key, UsageCount = g.Count() })
                .OrderByDescending(g => g.UsageCount)
                .ToListAsync();

            return Ok(result);
        }

        //usage of rooms by departments
        [HttpGet("RoomUsageByDepartment")]
        public async Task<IActionResult> GetRoomUsageByDepartment()
        {
            var result = await dbContext.Bookings
                .GroupBy(b => new { b.RoomId, b.Employee_Number })
                .Select(g => new
                {
                    g.Key.RoomId,
                    g.Key.Employee_Number,
                    UsageCount = g.Count()
                })
                .ToListAsync();

            return Ok(result);
        }

        //room availability
        [HttpGet("RoomAvailability")]
        public async Task<IActionResult> GetRoomAvailability()
        {
            var available = await dbContext.Rooms.CountAsync(r => r.Status == "Available");
            var unavailable = await dbContext.Rooms.CountAsync(r => r.Status != "Available");

            return Ok(new { Available = available, Unavailable = unavailable });
        }
    }
}
