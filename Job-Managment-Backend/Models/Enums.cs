namespace Job_Managment_Backend.Models
{
    public class Enums
    {
        public enum JobPriority
        {
            High = 0,  // Lower value = higher priority
            Regular = 1,
            Low = 2
        }

        public enum JobStatus
        {
            Pending,
            InProgress,
            Completed,
            Stopped,
            Failed
        }

        public enum WorkerStatus
        {
            Busy,
            Available,
            Offline
        }
    }
}
