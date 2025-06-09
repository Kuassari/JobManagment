using Microsoft.AspNetCore.SignalR;
using Job_Managment_Backend.Models;

namespace Job_Managment_Backend.Hubs
{
    public class WorkerHub : Hub
    {
        private readonly ILogger<WorkerHub> _logger;

        public WorkerHub(ILogger<WorkerHub> logger)
        {
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            _logger.LogInformation("Client connected to WorkerHub: {ConnectionId}", Context.ConnectionId);
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _logger.LogInformation("Client disconnected from WorkerHub: {ConnectionId}", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }

        public async Task NotifyWorkerUpdated(Worker worker)
        {
            await Clients.All.SendAsync("WorkerUpdated", worker);
            _logger.LogInformation("Notified clients of worker update: {WorkerId}, Status: {Status}",
                worker.Id, worker.Status);
        }

        public async Task NotifyWorkerAdded(Worker worker)
        {
            await Clients.All.SendAsync("WorkerAdded", worker);
            _logger.LogInformation("Notified clients of new worker: {WorkerId}", worker.Id);
        }
    }
}