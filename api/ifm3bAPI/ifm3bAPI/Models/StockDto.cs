using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models
{
    public class StockDto
    {
        [Key]
        public required string StockId { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "Stock available must be non negative")]
        public int StockAvailable { get; set; }

        [Range(0, int.MaxValue, ErrorMessage = "EstimatedFull must be non negative")]
        public int EstimatedFull { get; set; }

        public string? StockReport { get; set; }
    }
}
