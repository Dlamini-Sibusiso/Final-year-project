using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models.Entities
{
    public class Room
    {
        [Key]
        public required string RoomId { get; set; }
        public required string Description { get; set; }
        public int Capacity { get; set; }
        public required string Amenities { get; set; }
        public required string Status { get; set; }
        public string? Reason { get; set; }
        public string? ImageUrl { get; set; }
    }
}
