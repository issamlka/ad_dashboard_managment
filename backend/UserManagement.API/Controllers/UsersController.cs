using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserManagement.API.Data;
using UserManagement.API.Models;
using UserManagement.API.Services;

namespace UserManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        private readonly AuditLogService _auditLogService;

        public UsersController(AppDbContext context, AuditLogService auditLogService)
{
    _context = context;
    _auditLogService = auditLogService;
}

        // GET api/users
        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _context.Users.ToListAsync();
            return Ok(users);
        }

        // GET api/users/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
                return NotFound(new { message = $"User with ID {id} not found" });
            return Ok(user);
        }

        // Update CreateUser:
[HttpPost]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> CreateUser([FromBody] User newUser)
{
    if (string.IsNullOrEmpty(newUser.Password))
        return BadRequest(new { message = "Password is required" });

    newUser.Password = BCrypt.Net.BCrypt.HashPassword(newUser.Password);
    newUser.CreatedAt = DateTime.UtcNow;
    _context.Users.Add(newUser);
    await _context.SaveChangesAsync();

    // ← Log action
    await _auditLogService.LogAsync(
        action: "CREATE_DB_USER",
        performedBy: User.Identity?.Name ?? "Unknown",
        target: newUser.Username,
        details: $"Created DB user {newUser.Username} with role {newUser.Role}"
    );

    return CreatedAtAction(nameof(GetUserById), new { id = newUser.Id }, newUser);
}

        // Update UpdateUser:
[HttpPut("{id}")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> UpdateUser(int id, [FromBody] User updatedUser)
{
    var user = await _context.Users.FindAsync(id);
    if (user == null)
        return NotFound(new { message = $"User with ID {id} not found" });

    user.FirstName = updatedUser.FirstName;
    user.LastName = updatedUser.LastName;
    user.Email = updatedUser.Email;
    user.Username = updatedUser.Username;
    user.Role = updatedUser.Role;
    user.IsActive = updatedUser.IsActive;

    if (!string.IsNullOrEmpty(updatedUser.Password))
        user.Password = BCrypt.Net.BCrypt.HashPassword(updatedUser.Password);

    await _context.SaveChangesAsync();

    // ← Log action
    await _auditLogService.LogAsync(
        action: "EDIT_DB_USER",
        performedBy: User.Identity?.Name ?? "Unknown",
        target: user.Username,
        details: $"Updated DB user {user.Username}"
    );

    return Ok(user);
}

// Update DeleteUser:
[HttpDelete("{id}")]
[Authorize(Roles = "Admin")]
public async Task<IActionResult> DeleteUser(int id)
{
    var user = await _context.Users.FindAsync(id);
    if (user == null)
        return NotFound(new { message = $"User with ID {id} not found" });

    _context.Users.Remove(user);
    await _context.SaveChangesAsync();

    // ← Log action
    await _auditLogService.LogAsync(
        action: "DELETE_DB_USER",
        performedBy: User.Identity?.Name ?? "Unknown",
        target: user.Username,
        details: $"Deleted DB user {user.Username}"
    );

    return Ok(new { message = $"User with ID {id} deleted successfully" });
}
    }
}