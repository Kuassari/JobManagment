using Job_Managment_Backend.Models;
using Microsoft.EntityFrameworkCore;
using static Job_Managment_Backend.Models.Enums;

namespace Job_Managment_Backend.Data
{
    public class SeedData
    {
        public static void Initialize(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

            try
            {
                context.Database.Migrate();

                // Seed jobs if none exist
                if (!context.Jobs.Any())
                {
                    logger.LogInformation("Seeding initial jobs");
                    context.Jobs.AddRange(
                        new Job
                        {
                            Id = Guid.NewGuid(),
                            Name = "Sample High Priority Job",
                            Status = JobStatus.Pending,
                            Priority = JobPriority.High,
                            ScheduledStartTime = DateTime.UtcNow,
                            Progress = 0
                        },
                        new Job
                        {
                            Id = Guid.NewGuid(),
                            Name = "Sample Regular Priority Job",
                            Status = JobStatus.Pending,
                            Priority = JobPriority.Regular,
                            ScheduledStartTime = DateTime.UtcNow,
                            Progress = 0
                        },
                        new Job
                        {
                            Id = Guid.NewGuid(),
                            Name = "Sample Future Job",
                            Status = JobStatus.Pending,
                            Priority = JobPriority.High,
                            ScheduledStartTime = DateTime.UtcNow.AddHours(2), // Future job
                            Progress = 0
                        },
                        new Job
                        {
                            Id = Guid.NewGuid(),
                            Name = "Sample Low Priority Job",
                            Status = JobStatus.Pending,
                            Priority = JobPriority.Low,
                            ScheduledStartTime = DateTime.UtcNow,
                            Progress = 0
                        }
                    );
                }

                // Seed workers if none exist
                if (!context.Workers.Any())
                {
                    logger.LogInformation("Seeding initial workers");
                    context.Workers.AddRange(
                        new Worker
                        {
                            Id = Guid.NewGuid(),
                            Name = "Worker 1",
                            Status = WorkerStatus.Available
                        },
                        new Worker
                        {
                            Id = Guid.NewGuid(),
                            Name = "Worker 2",
                            Status = WorkerStatus.Available
                        },
                        new Worker
                        {
                            Id = Guid.NewGuid(),
                            Name = "Worker 3",
                            Status = WorkerStatus.Available
                        }
                    );
                }

                context.SaveChanges();
                logger.LogInformation("Database seeding completed successfully");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while seeding the database");
                throw new InvalidOperationException("Database seeding failed.", ex);
            }
        }
    }
}
