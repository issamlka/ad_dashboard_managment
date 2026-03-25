using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserManagement.API.Data;
using UserManagement.API.Models;

namespace UserManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PermissionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PermissionsController(AppDbContext context)
        {
            _context = context;
        }

        // GET api/permissions/user/2
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserPermissions(int userId)
        {
            var permission = await _context.UserPermissions
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (permission == null)
                return NotFound(new { message = "Permissions not found" });

            return Ok(permission);
        }

        // GET api/permissions/my
        [HttpGet("my")]
        public async Task<IActionResult> GetMyPermissions()
        {
            // Get current user from JWT token
            var username = User.Identity?.Name;
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null)
                return NotFound();

            var permission = await _context.UserPermissions
                .FirstOrDefaultAsync(p => p.UserId == user.Id);

            if (permission == null)
                return Ok(new UserPermission { UserId = user.Id });

            return Ok(permission);
        }

        // PUT api/permissions/user/2
        [HttpPut("user/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserPermissions(
            int userId,
            [FromBody] UserPermission updatedPermission)
        {
            // Prevent modifying Admin permissions
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return NotFound(new { message = "User not found" });

            if (user.Role == "Admin")
                return BadRequest(new { message = "Cannot modify Admin permissions" });

            var permission = await _context.UserPermissions
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (permission == null)
            {
                // Create new permissions if not exists
                updatedPermission.UserId = userId;
                _context.UserPermissions.Add(updatedPermission);
            }
            else
            {
                permission.CanCreateAdUsers = updatedPermission.CanCreateAdUsers;
                permission.CanDisableEnableAdUsers = updatedPermission.CanDisableEnableAdUsers;
                // permission.CanCreateDbUsers = updatedPermission.CanCreateDbUsers;
                // permission.CanEditDbUsers = updatedPermission.CanEditDbUsers;
                // permission.CanDeleteDbUsers = updatedPermission.CanDeleteDbUsers;
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Permissions updated for {user.Username}" });
        }
    }
}