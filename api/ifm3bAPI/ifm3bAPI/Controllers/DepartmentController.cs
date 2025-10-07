using ifm3bAPI.Data;
using ifm3bAPI.Models;
using ifm3bAPI.Models.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ifm3bAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DepartmentController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public DepartmentController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        //getting all available departments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<string>>> GetDepartmetIds()
        {
            var amen = await dbContext.Departments.Select(a => a.DepartmentId).ToListAsync();

            return Ok(amen);
        }

        //adding department
        [HttpPost]
        public async Task<IActionResult> Adddepartment([FromBody] DepartmentDto departmentDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await dbContext.Departments.AnyAsync(a => a.DepartmentId == departmentDto.DepartmentId))
            {
                return Conflict("Department name already exists.");
            }

            var department = new Department
            {
                DepartmentId = departmentDto.DepartmentId
            };

            dbContext.Departments.Add(department);
            await dbContext.SaveChangesAsync();

            return Ok("department successfully added.");
        }

        //deleting department by id
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deletedepartment(string id)
        {
            var department = await dbContext.Departments.FindAsync(id);
            if (department == null)
            {
                return NotFound();
            }

            dbContext.Departments.Remove(department);
            await dbContext.SaveChangesAsync();

            return Ok("Department successfully deleted.");
        }
    }
}
