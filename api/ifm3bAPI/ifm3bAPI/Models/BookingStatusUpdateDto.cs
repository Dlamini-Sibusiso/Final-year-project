namespace ifm3bAPI.Models
{
    public class BookingStatusUpdateDto
    {
        public required string Status { get; set; }
        public string? StatusInfo { get; set; }
    }
}
