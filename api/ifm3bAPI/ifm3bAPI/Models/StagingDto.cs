namespace ifm3bAPI.Models
{
    public class StagingDto
    {
        public required string StockId { get; set; }
        public int Quantity { get; set; }
        public string? UserId { get; set; }
    }
}
