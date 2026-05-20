using Microsoft.EntityFrameworkCore;
using LabInventory.API.Models;

namespace LabInventory.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Admin> Admins { get; set; }
        public DbSet<Material> Materials { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure AuditLog
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.HasKey(e => e.LogId);
                entity.Property(e => e.SearchKeywords).HasMaxLength(4000);
            });

            // Configure Material
            modelBuilder.Entity<Material>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            // Configure Admin
            modelBuilder.Entity<Admin>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Username).IsUnique();
            });
        }
    }
}
