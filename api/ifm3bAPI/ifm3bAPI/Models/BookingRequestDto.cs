namespace ifm3bAPI.Models
{
    public class BookingRequestDto
    {
        public string? BookingId { get; set; }
        public int Employee_Number { get; set; }
        public required string RoomId { get; set; }
        public DateTime Sesion_Start { get; set; }
        public DateTime Sesion_End { get; set; }
        public int Capacity { get; set; }
        public required string Amenities { get; set; }
        public required string Stock { get; set; }
        public required string NewStock { get; set; }
        public required string Status { get; set; }
        public string? StatusInfo { get; set; }
    }
}
