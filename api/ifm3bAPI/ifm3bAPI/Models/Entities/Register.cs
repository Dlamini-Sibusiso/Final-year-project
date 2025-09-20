using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models.Entities
{
    public class Register
    {   
        [Key]
        public int Id { get; set; }//employee number
        public required string Username { get; set; }
        public required string Password { get; set; }
        public required string Department { get; set; }
        public required string Phone_Number { get; set; }
        public required string Email { get; set; }
        public required string Role { get; set; }
    }
}
