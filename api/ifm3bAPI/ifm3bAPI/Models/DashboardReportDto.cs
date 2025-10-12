namespace ifm3bAPI.Models
{
    public record RoomUsageDto(string RoomId, string Description, int Capacity, int UsageCount);
    public record BookingEventDto(string id, string title, DateTime start, DateTime end, string roomId);
    public record CapacityStatDto(int Capacity, int Count);
    public class DashboardReportDto
    {
        public int TotalRooms { get; init; }
        public int ActiveRooms { get; init; }
        public int MaintenanceRooms { get; init; }
        public int TodaysBookingsCount { get; init; }
        public int NewBookingsCount { get; init; }
        public IEnumerable<RoomUsageDto> MostUsedRooms { get; init; } = Array.Empty<RoomUsageDto>();
        //public IEnumerable<(int Capacity, int Count)> MostRequestedCapacities { get; init; } = Array.Empty<(int, int)>();
        public IEnumerable<CapacityStatDto> MostRequestedCapacities { get; init; } = Array.Empty<CapacityStatDto>();
        public IEnumerable<BookingEventDto> UpcomingBookings { get; init; } = Array.Empty<BookingEventDto>();
    }
}
