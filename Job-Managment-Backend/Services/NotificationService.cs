using Job_Managment_Backend.Hubs;
using Job_Managment_Backend.Models;
using Microsoft.AspNetCore.SignalR;

namespace Job_Managment_Backend.Services
{
    public class NotificationService
    {
        private readonly IHubContext<JobHub> _jobHub;
        private readonly IHubContext<WorkerHub> _workerHub;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IHubContext<JobHub> jobHub,
            IHubContext<WorkerHub> workerHub,
            ILogger<NotificationService> logger)
        {
            _jobHub = jobHub;
            _workerHub = workerHub;
            _logger = logger;
        }

        public async Task NotifyJobUpdate(Job job)
        {
            try
            {
                await _jobHub.Clients.All.SendAsync("JobUpdated", job);
                _logger.LogInformation("Notified clients of job update: {JobId}, Status: {Status}", job.Id, job.Status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying job update: {JobId}", job.Id);
            }
        }

        public async Task NotifyWorkerUpdate(Worker worker)
        {
            try
            {
                await _workerHub.Clients.All.SendAsync("WorkerUpdated", worker);
                _logger.LogInformation("Notified clients of worker update: {WorkerId}, Status: {Status}", worker.Id, worker.Status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error notifying worker update: {WorkerId}", worker.Id);
            }
        }
    }
}
