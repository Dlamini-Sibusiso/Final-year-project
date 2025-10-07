using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models.Entities
{
    public class Department
    {
        [Key]
        public required string DepartmentId { get; set; }
    }
}
