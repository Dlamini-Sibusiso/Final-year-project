using ifm3bAPI.Data;
using ifm3bAPI.Models;
using ifm3bAPI.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
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
                    return Ok(registerEntity);
                }
                return Conflict(new { message = "Sign up Unsuccessful! You already registered, sign in or got to forgot password" });
            }
            return Conflict(new {message = "Username already exist"});
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
                    return Unauthorized("Invalid username or password.");
                }

                //verifying hashed password entered by user
                var passResult = _passwordHasher.VerifyHashedPassword(user, user.Password, loginDto.Password);

                if (passResult == PasswordVerificationResult.Success)
                {
                    var token = CreateJwtToken(user);
                    return Ok(new { token });
                }
                return Unauthorized("Invalid username or password.");
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
                    expires: DateTime.UtcNow.AddHours(1),
                    signingCredentials: creds
                );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        
        [Authorize]
        [HttpGet("profile")]
        public IActionResult Profile()
        {
            var username = User.Identity?.Name;
            return Ok(new {message = $"Welcome {username}!"});
        }
        
        //Update or Edit using employee_number
        [HttpPut]
        [Route("{id:int}")]
        public IActionResult UpdateRegister(int id, UpdateRegisterDto updateRegisterDto) 
        {
            //Validating the incoming request body
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //finding user by searching table Registers
            var user = dbContext.Registers.Find(id);

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
 
            dbContext.SaveChanges();//save the changes made to the database
            return Ok(user);
        }

        //Delete user in Register controller
        [HttpDelete]
        [Route("{id:int}")]
        public IActionResult DeleteRegister(int id) 
        {
            var user = dbContext.Registers.Find(id);

            if (user is null)
            {
                return NotFound(new { meassage = "The user was not found"});
            }

            dbContext.Registers.Remove(user);
            dbContext.SaveChanges();
            return Ok(user);
        }
    }
}
