using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models.Entities
{
    public class BookingTemp
    {
        [Key]
        public int Id { get; set; }
        public required string BookingId { get; set; }
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
