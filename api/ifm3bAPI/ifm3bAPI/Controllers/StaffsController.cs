using ifm3bAPI.Data;
using ifm3bAPI.Models;
using ifm3bAPI.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ifm3bAPI.Controllers
{
    //localhost:5289/api/Staffs
    [Route("api/[controller]")]
    [ApiController]
    public class StaffsController(ApplicationDbContext dbContext) : ControllerBase
    {
        //private field to use
        private readonly ApplicationDbContext dbContext = dbContext;

        //get all staff from db
        [HttpGet]
        public IActionResult GetAllStaffs()
        {
            var allStaffs = dbContext.Staffs.ToList();
            if (!allStaffs.Any()) //check if list is empty
            {
                return NotFound(new { message = "No staff was found" });
            }

            return Ok(allStaffs);
        }

        //get staff by id from db
        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetStaffById(int id)
        {
            var staff = dbContext.Staffs.Find(id);
            if (staff is null)
            {
                return NotFound(new { meassage = "Staff was not found" });//404 result
            }
            return Ok(staff);
        }

        //Adding staff to db
        [HttpPost]
        public IActionResult AddStaff([FromBody] AddStaffDto addStaffDto)
        {
            //Validating the incoming request body
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //find if the user is not already added as a Staff
            var user = dbContext.Staffs.Find(addStaffDto.Employee_Number);//search table Staffs

            if (user is null)
            {
                //Staff comes from entities
                var staffEntity = new Staff()
                {
                    Employee_Number = addStaffDto.Employee_Number,
                    Role = addStaffDto.Role
                };

                dbContext.Staffs.Add(staffEntity);
                dbContext.SaveChanges();//save the changes made to the database
                return Ok(staffEntity);
            }
            return Conflict(new { message = "User already exist,sign-in or sign-up" });
        }

        //Update or Edit Role using employee_number and will also update in Registers table
        [HttpPut]
        [Route("{id:int}")]
        public IActionResult UpdateStaff(int id, UpdateStaffDto updateStaffDto)
        {
            //Validating the incoming request body
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            //finding user by searching table Staffs
            var user = dbContext.Staffs.Find(id);

            if (user is null)
            {
                return NotFound(new { meassage = "Staff was not found, must be added under staff and then register." });
            }

            //finding user by searching table Registers to also change role
            var userRegister = dbContext.Registers.Find(id);

            if (userRegister is null)
            {
                return NotFound(new { meassage = "User was not found. User must register first." });
            }
           
            userRegister.Role = updateStaffDto.Role;//Edit Registers table

            user.Role = updateStaffDto.Role;//Edit Staffs table

            dbContext.SaveChanges();//save the changes made to the database
            return Ok(user);
        }

        //Delete staff in table Staffs and Registers table if available
        [HttpDelete]
        [Route("{id:int}")]
        public IActionResult DeleteStaff(int id)
        {
            var user = dbContext.Staffs.Find(id);//Staffs table

            if (user is null)
            {
                return NotFound(new { meassage = "Staff was not found" });
            }

            var userRegister = dbContext.Registers.Find(id);//Registers table

            if (userRegister is not null)
            {
                dbContext.Registers.Remove(userRegister);
            }

            dbContext.Staffs.Remove(user);
            dbContext.SaveChanges();
            return Ok(user);
        }
    }
}
