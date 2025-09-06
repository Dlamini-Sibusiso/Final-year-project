using System.ComponentModel.DataAnnotations;

namespace ifm3bAPI.Models.Entities
{
    public class Amenity
    {
        [Key]
        public required string AmenitiesId { get; set; }
    }
}
