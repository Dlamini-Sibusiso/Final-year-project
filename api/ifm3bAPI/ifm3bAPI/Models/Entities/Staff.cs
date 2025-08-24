using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models.Entities
{
    public class Staff
    {
        [Key]
        public int Employee_Number { get; set; }
        public required string Role { get; set; }
    }
}
