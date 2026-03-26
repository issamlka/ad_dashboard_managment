using Microsoft.EntityFrameworkCore;
using UserManagement.API.Models;
using BCrypt.Net;

namespace UserManagement.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<UserPermission> UserPermissions { get; set; } // ← add this
        public DbSet<AuditLog> AuditLogs { get; set; } // ← add this

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // One-to-one relationship
            modelBuilder.Entity<UserPermission>()
                .HasOne(p => p.User)
                .WithOne(u => u.Permission)
                .HasForeignKey<UserPermission>(p => p.UserId);

            modelBuilder.Entity<User>().HasData(
                new User {
                    Id = 1,
                    FirstName = "John",
                    LastName = "Doe",
                    Email = "john@example.com",
                    Username = "johndoe",
                    Password = "$2a$11$.8uwjJbIrbqNM/83gO3lpurvtCXQYqPsntfHz9NxFh/Nag7bbNMgS",
                    Role = "Admin",
                    IsActive = true,
                    CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
                
            );

            // Seed default permissions for existing users
            modelBuilder.Entity<UserPermission>().HasData(
                new UserPermission {
                    Id = 1,
                    UserId = 1,
                    CanCreateAdUsers = true,
                    CanDisableEnableAdUsers = true,
                    // CanCreateDbUsers = true,
                    // CanEditDbUsers = true,
                    // CanDeleteDbUsers = true
                }
            );
        }
    }
}