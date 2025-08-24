using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models
{
    public class AddStaffDto
    {
        public int Employee_Number { get; set; }

        [Required(ErrorMessage = "Role is required")]
        public required string Role { get; set; }
    }
}
