using ifm3bAPI.Data;
using ifm3bAPI.Models;
using ifm3bAPI.Models.Entities;
using ifm3bAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace ifm3bAPI.Controllers
{   //localhost:5289/api/Registers
    [Route("api/[controller]")]
    [ApiController]
    public class RegisterController : Controller
    {
        private readonly ApplicationDbContext dbContext;//database
        private readonly IConfiguration _config;
        private readonly PasswordHasher<Register> _passwordHasher;

        public RegisterController(ApplicationDbContext dbContext, IConfiguration config)
        {
            this.dbContext = dbContext;
            _config = config;
            _passwordHasher = new PasswordHasher<Register>();
        }

        //get all registered employee from db
        [HttpGet]
        public IActionResult GetAllRegisters()
        {
            var allRegisters = dbContext.Registers.ToList();
            if (!allRegisters.Any()) //check if list is empty
            { 
                return NotFound(new {message="No employee, clerk, manager was found"});
            }

            return Ok(allRegisters);
        }

        //get register (user) by id from db
        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetRegisterById(int id)
        {
            var register = dbContext.Registers.Find(id);
            if (register is null)
            {
                return NotFound(new { message = "No user was found with that employee number" });//404 result
            }
            return Ok(register);
        }

        //Adding register (user) to db
        [HttpPost("register")]
        public IActionResult AddRegister([FromBody] AddRegisterDto addRegisterDto)
        {
            try { 
                //Validating the incoming request body
                if (!ModelState.IsValid) 
                { 
                    return BadRequest(ModelState);
                }

                //find if the username already exist 
                var user = dbContext.Registers.FirstOrDefault(u => u.Username == addRegisterDto.Username);

                if (user is null)
                {
                    //find if the user do not already exist on the system
                    var userId = dbContext.Registers.Find(addRegisterDto.Id);

                    if (userId is null)
                    {
                        //Register comes from entities
                        var registerEntity = new Register()
                        {
                            Id = addRegisterDto.Id,
                            Username = addRegisterDto.Username,
                            Password = _passwordHasher.HashPassword(null!, addRegisterDto.Password),
                            Department = addRegisterDto.Department,
                            Phone_Number = addRegisterDto.Phone_Number,
                            Email = addRegisterDto.Email,
                            Role = addRegisterDto.Role
                        };

                        dbContext.Registers.Add(registerEntity);
                        dbContext.SaveChanges();//save the changes made to the database
                        return Ok(new {message = "Successfully registered. You can sign in now"});//registerEntity);
                    }
                    return Conflict(new { message = "Sign up Unsuccessful! You already registered, sign in or go to forgot password" });
                }
                return Conflict(new {message = "Username already exist"});
            }
            catch (Exception ex)
            {
                Console.WriteLine("Internal Error: " + ex.Message);
                return StatusCode(500, new { message = "Internal server error", detail = ex.Message });
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginDto loginDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var user = dbContext.Registers.FirstOrDefault(u => u.Username == loginDto.Username);

                if (user is null)
                {
                    return Unauthorized(new { message = "Invalid username or password." });
                }

                //verifying hashed password entered by user
                var passResult = _passwordHasher.VerifyHashedPassword(user, user.Password, loginDto.Password);

                if (passResult == PasswordVerificationResult.Success)
                {
                    var token = CreateJwtToken(user);
                    return Ok(new { token });
                }
                return Unauthorized(new{ message = "Invalid username or password."});
            }
            catch (Exception ex) 
            { 
                return StatusCode(500, new { message = ex.Message, stackTrace = ex.StackTrace });
            }
        }

        private string CreateJwtToken(Register user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Role, user.Role),
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                    issuer: _config["Jwt:Issuer"],
                    audience: _config["Jwt:Audience"],
                    claims: claims,
                    expires: DateTime.UtcNow.AddHours(2),
                    signingCredentials: creds
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
        [Authorize]
        [HttpGet("profile")]
        public IActionResult Profile()
        {
            var username = User.Identity?.Name;
            return Ok(new {message = $"Welcome {username}" });
        }
        
        //Update or Edit using employee_number
        [HttpPut]
        [Route("{id:int}")]
        public async Task<IActionResult> UpdateRegister(int id, UpdateRegisterDto updateRegisterDto) 
        {
            //Validating the incoming request body
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //finding user by searching table Registers
            var user = await dbContext.Registers.FindAsync(id);

            if (user is null)
            {
                return NotFound(new {meassage ="The user was not found"});
            }
            
            user.Username = updateRegisterDto.Username;
            user.Password = _passwordHasher.HashPassword(null!, updateRegisterDto.Password);//updateRegisterDto.Password;
            user.Department = updateRegisterDto.Department;
            user.Phone_Number = updateRegisterDto.Phone_Number;
            user.Email = updateRegisterDto.Email;
            user.Role = updateRegisterDto.Role;
 
            await dbContext.SaveChangesAsync();//save the changes made to the database
            return Ok(user);
        }

        //Delete user in Register controller
        [HttpDelete]
        [Route("{id:int}")]
        public async Task<IActionResult> DeleteRegister(int id) 
        {
            var user = await dbContext.Registers.FindAsync(id);

            if (user is null)
            {
                return NotFound(new { meassage = "The user was not found"});
            }

            dbContext.Registers.Remove(user);
            await dbContext.SaveChangesAsync();
            return Ok(user);
        }

        [HttpPost("forgotpassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] PasswordRequest request, [FromServices] EmailService emailService)
        {
            try
            {
                var empNumber = request.EmployeeNumber;
                Console.WriteLine($"Looking for user with EmployeeNumber: {empNumber}");

                var user = dbContext.Registers.FirstOrDefault(u => u.Id == empNumber);
                if (user is null)
                {
                    Console.WriteLine("User not found");
                    return NotFound(new { message = "User not found" });
                }

                if (string.IsNullOrWhiteSpace(user.Email))
                {
                    Console.WriteLine("User email is empty");
                    return BadRequest(new { message = "User does not have an email" });
                }

                //Generate random password
                string newPassword = GeneratePass();
                Console.WriteLine($"Generated password: {newPassword}");

                //Hash the password 
                user.Password = _passwordHasher.HashPassword(null!, newPassword);
                dbContext.SaveChanges();

                //Email send
                string subject = "Your new password";
                string body = $"Hello {user.Username}, \n\nYour new password is: {newPassword}\nPlease log in and change it immediately";

                await emailService.SendEmailAsync(user.Email, subject, body);

                return Ok(new { message = "Your new password has been sent to your email. Cancel and login." });

            }catch (Exception ex) { 
                Console.WriteLine("Internal Error: " + ex.Message);
                return StatusCode(500, new { message = "Internal server error", detail = ex.Message });
            }
        }

        private static string GeneratePass(int length = 10)
        {
            const string valid = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@$?_-";
            var result = new char[length];
            using var randNumG = RandomNumberGenerator.Create();
            byte[] uintBuffer = new byte[sizeof(uint)];

            for (int i = 0; i < length; i++)
            {
                randNumG.GetBytes(uintBuffer);
                uint num = BitConverter.ToUInt32(uintBuffer, 0);
                result[i] = valid[(int)(num % (uint)valid.Length)];
            }

            return new string(result);
        }
    }
}
