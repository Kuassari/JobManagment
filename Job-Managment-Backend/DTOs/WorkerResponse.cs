namespace Job_Managment_Backend.DTOs
{
    public class WorkerResponse
    {
        public Guid WorkerId { get; set; }
        public string? ErrorCode { get; set; }
        public string? ReturnMessage { get; set; }
    }
}
