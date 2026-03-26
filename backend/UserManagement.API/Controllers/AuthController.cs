using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using UserManagement.API.Data;
using UserManagement.API.Models;
using UserManagement.API.Services;

namespace UserManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly JwtService _jwtService;
        private readonly IConfiguration _configuration;
        private readonly AuditLogService _auditLogService;

        public AuthController(AppDbContext context, JwtService jwtService, IConfiguration configuration, AuditLogService auditLogService)
        {
            _context = context;
            _jwtService = jwtService;
            _configuration = configuration;
            _auditLogService = auditLogService;
        }

        [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var user = await _context.Users
            .Include(u => u.Permission)  // ← include permissions
            .FirstOrDefaultAsync(u => u.Username == request.Username);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
        {
            await _auditLogService.LogAsync(
                action: "LOGIN",
                performedBy: request.Username,
                target: request.Username,
                details: "Failed login attempt",
                status: "FAILED"
            );
            return Unauthorized(new { message = "Invalid username or password" });
        }

        if (!user.IsActive)
            return Unauthorized(new { message = "Your account is disabled" });

        await _auditLogService.LogAsync(
            action: "LOGIN",
            performedBy: user.Username,
            target: user.Username,
            details: $"Successful login as {user.Role}",
            status: "SUCCESS"
        );

        // Pass permission to token generator
        var token = _jwtService.GenerateToken(user, user.Permission);

        return Ok(new LoginResponse
        {
            Token = token,
            Username = user.Username,
            Role = user.Role,
            ExpiresAt = DateTime.UtcNow.AddMinutes(60),
            Domain = _configuration["LdapSettings:Domain"]!,
            AdServer = _configuration["LdapSettings:Server"]!
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var username = User.Identity?.Name ?? "Unknown";

        await _auditLogService.LogAsync(
            action: "LOGOUT",
            performedBy: username,
            target: username,
            details: $"User {username} logged out"
        );

        return Ok(new { message = "Logged out successfully" });
    }
}
}
