using Job_Managment_Backend.Models;
using Microsoft.EntityFrameworkCore;
using static Job_Managment_Backend.Models.Enums;

namespace Job_Managment_Backend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Job> Jobs { get; set; }
        public DbSet<Worker> Workers { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Job entity
            modelBuilder.Entity<Job>(entity =>
            {
                // Ensure JobStatus is stored as a string
                entity.Property(j => j.Status)
                    .HasConversion(
                        v => v.ToString(),
                        v => (JobStatus)Enum.Parse(typeof(JobStatus), v)
                    );

                // Ensure JobPriority is stored as a string
                entity.Property(j => j.Priority)
                    .HasConversion(
                        v => v.ToString(),
                        v => (JobPriority)Enum.Parse(typeof(JobPriority), v)
                    );
            });

            // Configure Worker entity
            modelBuilder.Entity<Worker>(entity =>
            {
                // Ensure WorkerStatus is stored as a string
                entity.Property(w => w.Status)
                    .HasConversion(
                        v => v.ToString(),
                        v => (WorkerStatus)Enum.Parse(typeof(WorkerStatus), v)
                    );

                // JobId is nullable for workers that are not processing a job
                entity.Property(w => w.CurrentJobId)
                    .IsRequired(false);
            });
        }
    }
}
