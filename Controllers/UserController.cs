using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LabInventory.API.Data;
using LabInventory.API.DTOs;
using LabInventory.API.Models;

namespace LabInventory.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Simple user login — creates an AuditLog entry and returns the LogId for the session.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
                return BadRequest(new { message = "Name is required." });

            var auditLog = new AuditLog
            {
                UserName = dto.Name.Trim(),
                LoginTime = DateTime.UtcNow,
                SearchKeywords = string.Empty,
                LogoutTime = null
            };

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                logId = auditLog.LogId,
                userName = auditLog.UserName,
                loginTime = auditLog.LoginTime
            });
        }

        /// <summary>
        /// Search materials and append the search keyword to the user's active AuditLog.
        /// Returns an empty array if nothing matches (strict search).
        /// </summary>
        [HttpPost("search")]
        public async Task<IActionResult> Search([FromBody] SearchDto dto)
        {
            // Append search keyword to audit log
            var log = await _context.AuditLogs.FindAsync(dto.LogId);
            if (log != null && !string.IsNullOrWhiteSpace(dto.Keyword))
            {
                log.SearchKeywords = string.IsNullOrEmpty(log.SearchKeywords)
                    ? dto.Keyword.Trim()
                    : log.SearchKeywords + ", " + dto.Keyword.Trim();

                await _context.SaveChangesAsync();
            }

            // Search materials — strict: returns empty if no match
            if (string.IsNullOrWhiteSpace(dto.Keyword))
                return Ok(new List<Material>());

            var results = await _context.Materials
                .Where(m => m.MaterialName.Contains(dto.Keyword.Trim()))
                .OrderBy(m => m.MaterialName)
                .ToListAsync();

            return Ok(results);
        }

        /// <summary>
        /// User logout — stamps the LogoutTime on their active AuditLog.
        /// </summary>
        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] UserLogoutDto dto)
        {
            var log = await _context.AuditLogs.FindAsync(dto.LogId);
            if (log == null)
                return NotFound(new { message = "Session not found." });

            log.LogoutTime = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Logged out successfully." });
        }
    }
}
