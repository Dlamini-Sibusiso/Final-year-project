using ifm3bAPI.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ifm3bAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AmenitiesController : ControllerBase
    {
        private readonly ApplicationDbContext dbContext;

        public AmenitiesController(ApplicationDbContext dbContext)
        {
            this.dbContext = dbContext;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<string>>> GetAmenitiesIds()
        {
            var amen = await dbContext.Amenities.Select(a => a.AmenitiesId).ToListAsync();

            return Ok(amen);
        }
    }
}
