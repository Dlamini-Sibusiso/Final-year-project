using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models
{
    public class UpdateRegisterDto
    {
        [Required(ErrorMessage = "Username is required")]
        public required string Username { get; set; }

        [Required(ErrorMessage = "Password is required")]
        public required string Password { get; set; }

        [Required(ErrorMessage = "Department is required")]
        public required string Department { get; set; }

        [Required(ErrorMessage = "Phone_Number is required")]
        public required string Phone_Number { get; set; }

        [Required(ErrorMessage = "Email is required")]
        public required string Email { get; set; }

        [Required(ErrorMessage = "Role is required")]
        public required string Role { get; set; }
    }
}
