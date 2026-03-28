using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserManagement.API.Models;
using UserManagement.API.Services;

namespace UserManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdStructureController : ControllerBase
    {
        private readonly LdapService _ldapService;
        private readonly AuditLogService _auditLogService;

        public AdStructureController(LdapService ldapService, AuditLogService auditLogService)
        {
            _ldapService = ldapService;
            _auditLogService = auditLogService;
        }

        // ─── GROUPS ────────────────────────────────────────────

        [HttpGet("groups")]
        public IActionResult GetAllGroups()
        {
            var groups = _ldapService.GetAllGroups();
            return Ok(groups);
        }

        [HttpGet("groups/{groupName}/members")]
        public IActionResult GetGroupMembers(string groupName)
        {
            var members = _ldapService.GetGroupMembers(groupName);
            return Ok(members);
        }

        [HttpPost("groups")]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest request)
        {
            if (string.IsNullOrEmpty(request.Name))
                return BadRequest(new { message = "Group name is required" });

            var result = _ldapService.CreateGroup(request.Name, request.Description);
            if (!result)
                return BadRequest(new { message = "Failed to create group" });

            await _auditLogService.LogAsync(
                action: "CREATE_AD_GROUP",
                performedBy: User.Identity?.Name ?? "Unknown",
                target: request.Name,
                details: $"Created AD group {request.Name}"
            );

            return Ok(new { message = $"Group {request.Name} created successfully!" });
        }

        [HttpPost("groups/{groupName}/members/{username}")]
        public async Task<IActionResult> AddUserToGroup(string groupName, string username)
        {
            var result = _ldapService.AddUserToGroup(username, groupName);
            if (!result)
                return BadRequest(new { message = "Failed to add user to group" });

            await _auditLogService.LogAsync(
                action: "ADD_TO_GROUP",
                performedBy: User.Identity?.Name ?? "Unknown",
                target: username,
                details: $"Added {username} to group {groupName}"
            );

            return Ok(new { message = $"User {username} added to {groupName}" });
        }

        [HttpDelete("groups/{groupName}/members/{username}")]
        public async Task<IActionResult> RemoveUserFromGroup(string groupName, string username)
        {
            var result = _ldapService.RemoveUserFromGroup(username, groupName);
            if (!result)
                return BadRequest(new { message = "Failed to remove user from group" });

            await _auditLogService.LogAsync(
                action: "REMOVE_FROM_GROUP",
                performedBy: User.Identity?.Name ?? "Unknown",
                target: username,
                details: $"Removed {username} from group {groupName}"
            );

            return Ok(new { message = $"User {username} removed from {groupName}" });
        }

        // ─── OUs ───────────────────────────────────────────────

        [HttpGet("ous")]
        public IActionResult GetAllOUs()
        {
            var ous = _ldapService.GetAllOUs();
            return Ok(ous);
        }

        [HttpPost("ous")]
        public async Task<IActionResult> CreateOU([FromBody] CreateOURequest request)
        {
            if (string.IsNullOrEmpty(request.Name))
                return BadRequest(new { message = "OU name is required" });

            var result = _ldapService.CreateOU(request.Name, request.Description);
            if (!result)
                return BadRequest(new { message = "Failed to create OU" });

            await _auditLogService.LogAsync(
                action: "CREATE_AD_OU",
                performedBy: User.Identity?.Name ?? "Unknown",
                target: request.Name,
                details: $"Created AD OU {request.Name}"
            );

            return Ok(new { message = $"OU {request.Name} created successfully!" });
        }

        [HttpGet("ous/{ouDN}/users")]
        public IActionResult GetUsersInOU(string ouDN)
        {
            var users = _ldapService.GetUsersInOU(ouDN);
            return Ok(users);
        }
    }

    public class CreateGroupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class CreateOURequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }
}