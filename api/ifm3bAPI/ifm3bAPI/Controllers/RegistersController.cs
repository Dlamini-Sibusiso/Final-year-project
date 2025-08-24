using ifm3bAPI.Data;
using ifm3bAPI.Models;
using ifm3bAPI.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ifm3bAPI.Controllers
{   //localhost:5289/api/Registers
    [Route("api/[controller]")]
    [ApiController]
    public class RegistersController(ApplicationDbContext dbContext) : ControllerBase
    {   //private field to use
        private readonly ApplicationDbContext dbContext = dbContext;

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
        [HttpPost]
        public IActionResult AddRegister([FromBody] AddRegisterDto addRegisterDto)
        {   
            //Validating the incoming request body
            if (!ModelState.IsValid) 
            { 
                return BadRequest(ModelState);
            }

            //find if the user is not already registered
            var user = dbContext.Registers.Find(addRegisterDto.Id);//search table Registers

            if (user is null)
            {
                //Register comes from entities
                var registerEntity = new Register()
                {
                    Id = addRegisterDto.Id,
                    Username = addRegisterDto.Username,
                    Password = addRegisterDto.Password,
                    Department = addRegisterDto.Department,
                    Phone_Number = addRegisterDto.Phone_Number,
                    Email = addRegisterDto.Email,
                    Role = addRegisterDto.Role
                };

                dbContext.Registers.Add(registerEntity);
                dbContext.SaveChanges();//save the changes made to the database
                return Ok(registerEntity);
            }
            return Conflict(new {message = "User already exist,sign-in or go to forgot password"});
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
            user.Password = updateRegisterDto.Password;
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
