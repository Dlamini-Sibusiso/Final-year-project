using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models
{
    public class UpdateProfileDto
    {
        public required string Department { get; set; }

        public required string Phone_Number { get; set; }

        public required string Email { get; set; }
    }
}
