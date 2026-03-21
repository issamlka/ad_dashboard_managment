using Microsoft.EntityFrameworkCore;
using UserManagement.API.Models;

namespace UserManagement.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, FirstName = "John", LastName = "Doe", Email = "john@example.com", Username = "johndoe", Password = "Admin123", Role = "Admin", IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new User { Id = 2, FirstName = "Jane", LastName = "Smith", Email = "jane@example.com", Username = "janesmith", Password = "User123", Role = "User", IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) },
                new User { Id = 3, FirstName = "Bob", LastName = "Johnson", Email = "bob@example.com", Username = "bobjohnson", Password = "User123", Role = "User", IsActive = true, CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc) }
            );
        }
    }
}