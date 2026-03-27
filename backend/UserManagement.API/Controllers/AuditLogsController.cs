using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserManagement.API.Data;

namespace UserManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AuditLogsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuditLogsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? action,
            [FromQuery] string? performedBy,
            [FromQuery] string? status,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 8)
        {
            var query = _context.AuditLogs.AsQueryable();

            // Filters
            if (!string.IsNullOrEmpty(action))
                query = query.Where(l => l.Action == action);

            if (!string.IsNullOrEmpty(performedBy))
                query = query.Where(l => l.PerformedBy.Contains(performedBy));

            if (!string.IsNullOrEmpty(status))
                query = query.Where(l => l.Status == status);

            // Total count for pagination
            var total = await query.CountAsync();

            // Paginated results — newest first
            var logs = await query
                .OrderByDescending(l => l.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                total,
                page,
                pageSize,
                totalPages = (int)Math.Ceiling(total / (double)pageSize),
                logs
            });
        }

        [HttpGet("recent-ad-users")]
public async Task<IActionResult> GetRecentAdUsers()
{
    var recentCreated = await _context.AuditLogs
        .Where(l => l.Action == "CREATE_AD_USER" && l.Status == "SUCCESS")
        .OrderByDescending(l => l.CreatedAt)
        .Take(5)
        .Select(l => new
        {
            username = l.Target,
            createdAt = l.CreatedAt,
            createdBy = l.PerformedBy,
        })
        .ToListAsync();

    return Ok(recentCreated);
}

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            // Last 7 days activity
            var nowUtc = DateTime.UtcNow;
            var last7Days = Enumerable.Range(0, 7)
                .Select(i => nowUtc.Date.AddDays(-i))
                .OrderBy(d => d)
                .ToList();

            var activityData = new List<object>();
            foreach (var day in last7Days)
            {
                var dayStart = day;
                var dayEnd = day.AddDays(1);

                var count = await _context.AuditLogs
                    .CountAsync(l => l.CreatedAt >= dayStart && l.CreatedAt < dayEnd);

                activityData.Add(new
                {
                    date = day.ToString("MMM dd"),
                    actions = count
                });
            }

            // Most active users (top 5)
            var mostActiveUsers = await _context.AuditLogs
                .Where(l => l.Status == "SUCCESS")
                .GroupBy(l => l.PerformedBy)
                .Select(g => new
                {
                    username = g.Key,
                    actions = g.Count()
                })
                .OrderByDescending(x => x.actions)
                .Take(5)
                .ToListAsync();

            // Total stats
            var totalActions = await _context.AuditLogs.CountAsync();
            var successActions = await _context.AuditLogs
                .CountAsync(l => l.Status == "SUCCESS");
            var failedActions = await _context.AuditLogs
                .CountAsync(l => l.Status == "FAILED");
            var todayStart = nowUtc.Date;
            var todayEnd = todayStart.AddDays(1);
            var todayActions = await _context.AuditLogs
                .CountAsync(l => l.CreatedAt >= todayStart && l.CreatedAt < todayEnd);

            return Ok(new
            {
                activityData,
                mostActiveUsers,
                totalActions,
                successActions,
                failedActions,
                todayActions
            });
        }
    }
}