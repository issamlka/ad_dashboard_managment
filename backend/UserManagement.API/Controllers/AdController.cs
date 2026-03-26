using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserManagement.API.Services;
using System.Linq;

namespace UserManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdController : ControllerBase
    {
        private readonly LdapService _ldapService;
        private readonly AuditLogService _auditLogService;

        public AdController(LdapService ldapService, AuditLogService auditLogService)
        {
            _ldapService = ldapService;
            _auditLogService = auditLogService;
        }

        // GET api/ad/users
        [HttpGet("users")]
        public IActionResult GetAllAdUsers()
        {
            var users = _ldapService.GetAllUsers();
            return Ok(users);
        }

        // GET api/ad/users/issamsharp
        [HttpGet("users/{username}")]
        public IActionResult GetAdUser(string username)
        {
            var user = _ldapService.GetUser(username);

            if (user == null)
                return NotFound(new { message = $"User {username} not found in Active Directory" });

            return Ok(user);
        }

        // POST api/ad/users
        [HttpPost("users")]
        [Authorize]
        public IActionResult CreateAdUser([FromBody] CreateAdUserRequest request)
        {
            var isAdmin = User.IsInRole("Admin");

            var canCreate = User.Claims
                .FirstOrDefault(c => c.Type == "CanCreateAdUsers")?.Value;

            if (!isAdmin && canCreate != "True")
                return Forbid("You don't have permission to create AD users");

            if (request.Password != request.ConfirmPassword)
                return BadRequest(new { message = "Passwords do not match" });

            if (string.IsNullOrEmpty(request.FirstName) ||
                string.IsNullOrEmpty(request.LastName) ||
                string.IsNullOrEmpty(request.Username) ||
                string.IsNullOrEmpty(request.LogonName) ||
                string.IsNullOrEmpty(request.Password))
                return BadRequest(new { message = "All fields are required" });

            var result = _ldapService.CreateUser(
                request.Username,
                request.FirstName,
                request.LastName,
                request.LogonName,
                request.Password
            );

            if (!result)
                return BadRequest(new { message = "Failed to create user in Active Directory" });

            // ← Log action
            _ = _auditLogService.LogAsync(
                action: "CREATE_AD_USER",
                performedBy: User.Identity?.Name ?? "Unknown",
                target: request.Username,
                details: $"Created AD user {request.Username} ({request.FirstName} {request.LastName})"
            );

            return Ok(new { message = $"User {request.Username} created successfully!" });
        }

        // PUT api/ad/users/issamsharp/disable
[HttpPut("users/{username}/disable")]
[Authorize]  // ← remove Roles = "Admin"
public async Task<IActionResult> DisableAdUser(string username)
{
    // Check if Admin OR has permission
    var isAdmin = User.IsInRole("Admin");
    var hasPermission = User.Claims
        .FirstOrDefault(c => c.Type == "CanDisableEnableAdUsers")?.Value == "True";

    if (!isAdmin && !hasPermission)
        return Forbid();

    var protectedAccounts = new[] { "administrator", "krbtgt" };
    if (protectedAccounts.Contains(username.ToLower()))
        return BadRequest(new { message = $"Cannot disable protected account: {username}" });

    var result = _ldapService.DisableUser(username);
    if (!result)
        return BadRequest(new { message = "Failed to disable user" });

    await _auditLogService.LogAsync(
        action: "DISABLE_AD_USER",
        performedBy: User.Identity?.Name ?? "Unknown",
        target: username,
        details: $"Disabled AD user {username}"
    );

    return Ok(new { message = $"User {username} disabled successfully" });
}

        // PUT api/ad/users/issamsharp/enable
[HttpPut("users/{username}/enable")]
[Authorize]  // ← remove Roles = "Admin"
public async Task<IActionResult> EnableAdUser(string username)
{
    // Check if Admin OR has permission
    var isAdmin = User.IsInRole("Admin");
    var hasPermission = User.Claims
        .FirstOrDefault(c => c.Type == "CanDisableEnableAdUsers")?.Value == "True";

    if (!isAdmin && !hasPermission)
        return Forbid();

    var protectedAccounts = new[] { "krbtgt" };
    if (protectedAccounts.Contains(username.ToLower()))
        return BadRequest(new { message = $"Cannot modify protected account: {username}" });

    var result = _ldapService.EnableUser(username);
    if (!result)
        return BadRequest(new { message = "Failed to enable user" });

    await _auditLogService.LogAsync(
        action: "ENABLE_AD_USER",
        performedBy: User.Identity?.Name ?? "Unknown",
        target: username,
        details: $"Enabled AD user {username}"
    );

    return Ok(new { message = $"User {username} enabled successfully" });
}
    }

    public class CreateAdUserRequest
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string LogonName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
    }
}