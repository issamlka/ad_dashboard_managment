using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserManagement.API.Services;

namespace UserManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AdGroupsController : ControllerBase
    {
        private readonly LdapService _ldapService;
        private readonly AuditLogService _auditLogService;

        public AdGroupsController(
            LdapService ldapService,
            AuditLogService auditLogService)
        {
            _ldapService = ldapService;
            _auditLogService = auditLogService;
        }

        // GET api/adgroups
        [HttpGet]
        public IActionResult GetAllGroups()
        {
            var groups = _ldapService.GetAllGroups();
            return Ok(groups);
        }

        // GET api/adgroups/IT Department/members
        [HttpGet("{groupName}/members")]
        public IActionResult GetGroupMembers(string groupName)
        {
            var members = _ldapService.GetGroupMembers(groupName);
            return Ok(members);
        }

        // POST api/adgroups
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateGroup(
            [FromBody] CreateGroupRequest request)
        {
            if (string.IsNullOrEmpty(request.Name))
                return BadRequest(new { message = "Group name is required" });

            var result = _ldapService.CreateGroup(
                request.Name,
                request.Description
            );

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

        // POST api/adgroups/IT Department/members
        [HttpPost("{groupName}/members")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AddUserToGroup(
            string groupName,
            [FromBody] GroupMemberRequest request)
        {
            var result = _ldapService.AddUserToGroup(groupName, request.Username);

            if (!result)
                return BadRequest(new { message = "Failed to add user to group" });

            await _auditLogService.LogAsync(
                action: "ADD_USER_TO_GROUP",
                performedBy: User.Identity?.Name ?? "Unknown",
                target: request.Username,
                details: $"Added {request.Username} to group {groupName}"
            );

            return Ok(new { message = $"User {request.Username} added to {groupName}!" });
        }

        // DELETE api/adgroups/IT Department/members/johndoe
        [HttpDelete("{groupName}/members/{username}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveUserFromGroup(
            string groupName,
            string username)
        {
            var result = _ldapService.RemoveUserFromGroup(groupName, username);

            if (!result)
                return BadRequest(new { message = "Failed to remove user from group" });

            await _auditLogService.LogAsync(
                action: "REMOVE_USER_FROM_GROUP",
                performedBy: User.Identity?.Name ?? "Unknown",
                target: username,
                details: $"Removed {username} from group {groupName}"
            );

            return Ok(new { message = $"User {username} removed from {groupName}!" });
        }
    }

    public class CreateGroupRequest
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
    }

    public class GroupMemberRequest
    {
        public string Username { get; set; } = string.Empty;
    }
}