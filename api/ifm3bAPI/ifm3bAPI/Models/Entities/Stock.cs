using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models.Entities
{
    public class Stock
    {
        [Key]
        public required string StockId { get; set; }
        public required string StockAvailable { get; set; }
        public int EstimatedFull { get; set; }
        public string? StockReport { get; set; }
    }
}
