using System.ComponentModel.DataAnnotations;
using static Job_Managment_Backend.Models.Enums;

namespace Job_Managment_Backend.DTOs
{
    public class JobRequest
    {
        public string? Name { get; set; }
        public JobPriority Priority { get; set; } = JobPriority.Regular;
        public DateTime? ScheduledStartTime { get; set; }
    }
}
