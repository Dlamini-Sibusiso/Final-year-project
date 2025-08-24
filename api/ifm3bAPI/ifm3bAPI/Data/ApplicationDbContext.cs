using ifm3bAPI.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace ifm3bAPI.Data
{
    public class ApplicationDbContext(DbContextOptions options) : DbContext(options)
    {
        //We use Entity name to create the database and
        //give it a plural name
        public DbSet <Register> Registers { get; set; }
        public DbSet <Staff> Staffs { get; set; }
    }
}
