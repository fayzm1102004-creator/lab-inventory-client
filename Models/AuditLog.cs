using System.ComponentModel.DataAnnotations;

namespace LabInventory.API.Models
{
    public class AuditLog
    {
        [Key]
        public int LogId { get; set; }

        [Required]
        [MaxLength(100)]
        public string UserName { get; set; } = string.Empty;

        public DateTime LoginTime { get; set; } = DateTime.UtcNow;

        /// <summary>
        /// Comma-separated list of search keywords made during the session.
        /// </summary>
        public string SearchKeywords { get; set; } = string.Empty;

        public DateTime? LogoutTime { get; set; }
    }
}
