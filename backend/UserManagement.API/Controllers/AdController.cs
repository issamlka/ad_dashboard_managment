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

        public AdController(LdapService ldapService)
        {
            _ldapService = ldapService;
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

            return Ok(new { message = $"User {request.Username} created successfully!" });
        }

        // PUT api/ad/users/issamsharp/disable
        [HttpPut("users/{username}/disable")]
        [Authorize]
        public IActionResult DisableAdUser(string username)
        {
            var isAdmin = User.IsInRole("Admin");

            var canToggle = User.Claims
                .FirstOrDefault(c => c.Type == "CanDisableEnableAdUsers")?.Value;

            if (!isAdmin && canToggle != "True")
                return Forbid("You don't have permission to disable users");

            var result = _ldapService.DisableUser(username);

            if (!result)
                return BadRequest(new { message = "Failed to disable user" });

            return Ok(new { message = $"User {username} disabled successfully" });
        }

        // PUT api/ad/users/issamsharp/enable
        [HttpPut("users/{username}/enable")]
        [Authorize]
        public IActionResult EnableAdUser(string username)
        {
            var isAdmin = User.IsInRole("Admin");

            var canToggle = User.Claims
                .FirstOrDefault(c => c.Type == "CanDisableEnableAdUsers")?.Value;

            if (!isAdmin && canToggle != "True")
                return Forbid("You don't have permission to enable users");

            var result = _ldapService.EnableUser(username);

            if (!result)
                return BadRequest(new { message = "Failed to enable user" });

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