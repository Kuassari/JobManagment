namespace Job_Managment_Backend.DTOs
{
    public class JobResponse
    {
        public Guid JobId { get; set; }
        public string? ErrorCode { get; set; }
        public string? ReturnMessage { set; get; }
    }
}
