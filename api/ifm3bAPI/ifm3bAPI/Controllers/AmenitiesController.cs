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

        [HttpPost]
        public async Task<IActionResult> AddAmenity([FromBody] AmenityDto amenitydto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (await dbContext.Amenities.AnyAsync(a => a.AmenitiesId == amenitydto.AmenitiesId))
            {
                return Conflict("Amenity name already exists.");
            }

            var amenity = new Amenity
            {
                AmenitiesId = amenitydto.AmenitiesId
            };

            dbContext.Amenities.Add(amenity);
            await dbContext.SaveChangesAsync();

            return Ok("Amenity successfully added.");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAmenity(string id)
        {
            var amenity = await dbContext.Amenities.FindAsync(id);
            if (amenity == null)
            {
                return NotFound();
            }

            dbContext.Amenities.Remove(amenity); 
            await dbContext.SaveChangesAsync();

            return Ok("Amenity successfully deleted.");
        }
    }
}

