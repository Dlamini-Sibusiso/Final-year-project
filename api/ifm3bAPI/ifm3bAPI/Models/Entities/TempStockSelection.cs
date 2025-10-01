using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models.Entities
{
    public class TempStockSelection
    {
        [Key]
        public Guid StagingId { get; set; }
        public Guid BookingId { get; set; }       // Reference to booking
        public required string StockId { get; set; }       // FK to Stock table
        public int Quantity { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? UserId { get; set; }
    }
}
