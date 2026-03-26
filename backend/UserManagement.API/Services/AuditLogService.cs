using UserManagement.API.Data;
using UserManagement.API.Models;

namespace UserManagement.API.Services
{
    public class AuditLogService
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditLogService(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        public async Task LogAsync(
            string action,
            string performedBy,
            string target,
            string details = "",
            string status = "SUCCESS")
        {
            var ipAddress = _httpContextAccessor.HttpContext?
                .Connection.RemoteIpAddress?.ToString() ?? "Unknown";

            var log = new AuditLog
            {
                Action = action,
                PerformedBy = performedBy,
                Target = target,
                Details = details,
                IpAddress = ipAddress,
                Status = status,
                CreatedAt = DateTime.UtcNow,
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
        }
    }
}