using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserManagement.API.Services;

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
        [Authorize(Roles = "Admin")]
        public IActionResult CreateAdUser([FromBody] CreateAdUserRequest request)
        {
            var result = _ldapService.CreateUser(request.Username, request.FullName, request.Password);
            if (!result)
                return BadRequest(new { message = "Failed to create user in Active Directory" });
            return Ok(new { message = $"User {request.Username} created successfully in Active Directory" });
        }

        // PUT api/ad/users/issamsharp/disable
        [HttpPut("users/{username}/disable")]
        [Authorize(Roles = "Admin")]
        public IActionResult DisableAdUser(string username)
        {
            var result = _ldapService.DisableUser(username);
            if (!result)
                return BadRequest(new { message = "Failed to disable user" });
            return Ok(new { message = $"User {username} disabled successfully" });
        }
    }

    public class CreateAdUserRequest
    {
        public string Username { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}