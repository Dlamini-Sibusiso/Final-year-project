using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models
{
    public class UpdateStaffDto
    {
        [Required(ErrorMessage = "Role is required")]
        public required string Role { get; set; }
    }
}
