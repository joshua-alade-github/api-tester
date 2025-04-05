using System;
using Microsoft.EntityFrameworkCore;
using ApiTester.Api.Models;

namespace ApiTester.Api.Data
{
    public class ApiTesterDbContext : DbContext
    {
        public ApiTesterDbContext(DbContextOptions<ApiTesterDbContext> options) : base(options) { }
        
        public DbSet<User> Users { get; set; }
        public DbSet<SavedRequest> SavedRequests { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<SavedRequest>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(r => r.UserId);
                
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();
        }
    }
    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? Username { get; set; }
        public string? Email { get; set; }
        public string? PasswordHash { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
    }
    
    public class SavedRequest
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string? UserId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public string? RequestJson { get; set; }
    }
}