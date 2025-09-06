namespace ifm3bAPI.Models
{
    public class UploadRoomDto
    {
        public required string RoomId { get; set; }
        public required string Description { get; set; }
        public int Capacity { get; set; }
        public required string Amenities { get; set; }
        public required string Status { get; set; }
        public string? Reason { get; set; }
        public IFormFile? Image { get; set; }
    }
}
