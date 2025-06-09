using System.ComponentModel.DataAnnotations;
using static Job_Managment_Backend.Models.Enums;

namespace Job_Managment_Backend.Models
{
    public class Job
    {
        public Guid Id { get; set; }
        public Guid? WorkerId { get; set; }
        public string? Name { get; set; }
        public JobPriority Priority { get; set; }
        public JobStatus Status { get; set; }
        public DateTime ScheduledStartTime { get; set; } // When job should start
        public DateTime? ActualStartTime { get; set; }   // When job actually started
        public DateTime? EndTime { get; set; }
        public int Progress { get; set; }
        public int RetryCount { get; set; }
        public int MaxRetries { get; set; } = 3;
        public string? ErrorMessage { get; set; } 


        // Factory method for creating a new job
        public static Job Create(string name, JobPriority priority, DateTime? scheduledStartTime = null)
        {
            return new Job
            {
                Id = Guid.NewGuid(),
                Name = name,
                Priority = priority,
                Status = JobStatus.Pending,
                ScheduledStartTime = scheduledStartTime ?? DateTime.UtcNow,
                Progress = 0,
                RetryCount = 0,
                ErrorMessage = ""
            };
        }
    }
}
