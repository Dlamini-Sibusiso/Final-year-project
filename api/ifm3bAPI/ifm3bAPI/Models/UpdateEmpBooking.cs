namespace ifm3bAPI.Models
{
    public class UpdateEmpBooking
    {
        public Guid BookingGuidToExclude { get; set; }
        public required string RoomId { get; set; }
        public DateTime SesionStart { get; set; }
        public DateTime SesionEnd { get; set; }
    }
}
