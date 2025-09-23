using ifm3bAPI.Data;
using ifm3bAPI.Models;
using ifm3bAPI.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;

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
        public async Task<IActionResult> GetAllStaffs()
        {
            try
            {
                var allStaffs = await dbContext.Staffs.ToListAsync();
                if (!allStaffs.Any()) //check if list is empty
                {
                    return NotFound(new { message = "No staff was found" });
                }

                return Ok(allStaffs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while getting all staff: {ex.Message}");
            }
        }

        //get staff by id from db
        [HttpGet]
        [Route("GetStaffById/{id}")]
        public async Task<IActionResult> GetStaffById(int id)
        {
            try
            {
                var staff = await dbContext.Staffs.FirstOrDefaultAsync(u => u.Employee_Number == id);
                if (staff is null)
                {
                    return NotFound(new { message = "Employee number was not found. You are not authorized to use the system. You must ask HR/Manager for assistant." });//404 result
                }
                return Ok(staff);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while getting staff by id : {ex.Message}");
            }
        }

        //Adding staff to db
        [HttpPost]
        public async Task<IActionResult> AddStaff([FromBody] AddStaffDto addStaffDto)
        {
            try
            {
                //Validating the incoming request body
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                //Validate role
                if (!(addStaffDto.Role == "Manager" || addStaffDto.Role == "Employee" || addStaffDto.Role == "Clerk"))
                {
                    return BadRequest("Role must either: Manager, Empployee and Clerk");
                }

                //find if the user is not already added as a Staff
                var user = await dbContext.Staffs.FindAsync(addStaffDto.Employee_Number);//search table Staffs

                if (user is null)
                {
                    //Staff comes from entities
                    var staffEntity = new Staff()
                    {
                        Employee_Number = addStaffDto.Employee_Number,
                        Role = addStaffDto.Role
                    };

                    dbContext.Staffs.Add(staffEntity);
                    await dbContext.SaveChangesAsync();//save the changes made to the database
                    return Ok(staffEntity);
                }
                return Conflict(new { message = "User already exist, sign-in or sign-up" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while adding staff: {ex.Message}");
            }
        }

        //Update or Edit Role using employee_number and will also update in Registers table
        [HttpPut]
        [Route("{id:int}")]
        public async Task<IActionResult> UpdateStaff(int id, UpdateStaffDto updateStaffDto)
        {
            try
            {
                //Validating the incoming request body
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                //finding user by searching table Staffs
                var user = await dbContext.Staffs.FindAsync(id);

                if (user is null)
                {
                    return NotFound(new { meassage = "Staff was not found, must be added under staff and then register." });
                }

                //finding user by searching table Registers to also change role
                var userRegister = await dbContext.Registers.FindAsync(id);

                if (userRegister is not null)
                {
                    //return NotFound(new { meassage = "User was not found. User must register first." });
                    userRegister.Role = updateStaffDto.Role;//Edit Registers table
                }

                user.Role = updateStaffDto.Role;//Edit Staffs table

                await dbContext.SaveChangesAsync();//save the changes made to the database
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while updating staff: {ex.Message}");
            }
        }

        //Delete staff in table Staffs and Registers table if available
        [HttpDelete]
        [Route("{id:int}")]
        public async Task<IActionResult> DeleteStaff(int id)
        {
            try
            {
                var user = await dbContext.Staffs.FindAsync(id);//Staffs table

                if (user is null)
                {
                    return NotFound(new { meassage = "Staff was not found" });
                }

                var userRegister = await dbContext.Registers.FindAsync(id);//Registers table

                if (userRegister is not null)
                {
                    dbContext.Registers.Remove(userRegister);
                }

                dbContext.Staffs.Remove(user);
                await dbContext.SaveChangesAsync();
                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while deleting staff: {ex.Message}");
            }
        }

        //Delete Registers table only for user to register again
        [HttpDelete]
        [Route("DeleteRegister/{id:int}")]
        public async Task<IActionResult> DeleteRegister(int id)
        {
            try
            {
                var userRegister = await dbContext.Registers.FindAsync(id);//Registers table

                if (userRegister is null)
                {
                    return NotFound(new { meassage = "User was not found" });
                }

                dbContext.Registers.Remove(userRegister);
                await dbContext.SaveChangesAsync();
                return Ok(userRegister);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while deleting user in Registers : {ex.Message}");
            }
        }
    }
}
