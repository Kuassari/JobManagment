using System.ComponentModel.DataAnnotations;
using static Job_Managment_Backend.Models.Enums;

namespace Job_Managment_Backend.Models
{
    public class Worker
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string? Name { get; set; } = string.Empty;
        public Guid? CurrentJobId { get; set; }
        public WorkerStatus Status { get; set; } = WorkerStatus.Available;
    }
}
