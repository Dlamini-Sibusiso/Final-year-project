namespace ifm3bAPI.Models
{
    public class RoomSearchDto
    {
        public DateTime SesionStart {  get; set; }
        public DateTime SesionEnd { get; set; }
        public int Capacity { get; set; }
        public required List<string> Amenities { get; set; }
    }
}
