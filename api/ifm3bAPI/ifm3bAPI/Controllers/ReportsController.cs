using ifm3bAPI.Data;
using ifm3bAPI.Models;
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

        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardReportDto>> GetDashboardReport()
        {
            var now = DateTime.UtcNow;
            var todayStart = now.Date;
            var todayEnd = todayStart.AddDays(1);

            // Basic counts
            var totalRooms = await dbContext.Rooms.CountAsync();
            var activeRooms = await dbContext.Rooms.CountAsync(r => r.Status == "Available");
            var maintenanceRooms = await dbContext.Rooms.CountAsync(r => r.Status == "Unavailable");

            var todaysBookingsCount = await dbContext.Bookings.CountAsync(b =>
                b.Sesion_Start >= todayStart && b.Sesion_Start < todayEnd);

            var newBookingsCount = await dbContext.Bookings.CountAsync(b => b.Status == "Pending");

            // Upcoming bookings (next 90 days)
            var upcomingBookings = await dbContext.Bookings
                .Where(b => b.Sesion_Start >= now && b.Sesion_Start <= now.AddDays(90))
                .OrderBy(b => b.Sesion_Start)
                .Select(b => new BookingEventDto(
                    b.BookingId,
                    $"Room: {b.RoomId} ({b.Capacity})",
                    b.Sesion_Start,
                    b.Sesion_End,
                    b.RoomId))
                .ToListAsync();

            // Most used rooms by number of bookings (top 5)
            var mostUsedRooms = await dbContext.Bookings
                .GroupBy(b => b.RoomId)
                .Select(g => new { RoomId = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .Join(dbContext.Rooms, b => b.RoomId, r => r.RoomId,
                    (b, r) => new RoomUsageDto(r.RoomId, r.Description, r.Capacity, b.Count))
                .ToListAsync();

            // Most requested capacities (group bookings by requested capacity)
            var capacityGroups = await dbContext.Bookings
                .GroupBy(b => b.Capacity)
                .Select(g => new { Capacity = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            // map to DTO after query runs
            var capacityStats = capacityGroups
                .Select(x => new CapacityStatDto(x.Capacity, x.Count))
                .ToList();

            var report = new DashboardReportDto
            {
                TotalRooms = totalRooms,
                ActiveRooms = activeRooms,
                MaintenanceRooms = maintenanceRooms,
                TodaysBookingsCount = todaysBookingsCount,
                NewBookingsCount = newBookingsCount,
                UpcomingBookings = upcomingBookings,
                MostUsedRooms = mostUsedRooms,
                MostRequestedCapacities = capacityStats
            };

            return Ok(report);
        }
    }
}
