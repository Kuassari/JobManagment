using Microsoft.AspNetCore.SignalR;
using Job_Managment_Backend.Models;

namespace Job_Managment_Backend.Hubs
{
    public class JobHub : Hub
    {
        private readonly ILogger<JobHub> _logger;

        public JobHub(ILogger<JobHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected to JobHub: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _logger.LogInformation("Client disconnected from JobHub: {ConnectionId}", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task NotifyJobAdded(Job job)
        {
            await Clients.All.SendAsync("JobAdded", job);
            _logger.LogInformation("Notified clients of new job: {JobId}", job.Id);
        }

        public async Task NotifyJobUpdated(Job job)
        {
            await Clients.All.SendAsync("JobUpdated", job);
            _logger.LogInformation("Notified clients of job update: {JobId}, Status: {Status}, Progress: {Progress}", job.Id, job.Status, job.Progress);
        }

        public async Task NotifyJobFailed(Job job)
        {
            await Clients.All.SendAsync("JobFailed", job);
            _logger.LogInformation("Notified clients of job failure: {JobId}", job.Id);
        }

        public async Task NotifyJobRetrying(Job job)
        {
            await Clients.All.SendAsync("JobRetrying", job);
            _logger.LogInformation("Notified clients of job retry: {JobId}", job.Id);
        }

        public async Task NotifyJobDeleted(Guid jobId)
        {
            await Clients.All.SendAsync("JobDeleted", jobId);
            _logger.LogInformation("Notified clients of job deletion: {JobId}", jobId);
        }
    }
}
