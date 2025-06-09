using Job_Managment_Backend.Services;

namespace Job_Managment_Backend.BackgroundServices
{
    public class JobQueueProcessor : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<JobQueueProcessor> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromSeconds(10);

        public JobQueueProcessor(
            IServiceProvider serviceProvider,
            ILogger<JobQueueProcessor> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Job Queue Processor starting up");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Create a scope to resolve scoped services and process the job queue
                    using var scope = _serviceProvider.CreateScope();
                    var workerService = scope.ServiceProvider.GetRequiredService<WorkerService>();
                    await workerService.TryAssignPendingJobsAsync();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while processing job queue");
                }

                // Wait for the next interval
                await Task.Delay(_checkInterval, stoppingToken);
            }
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Job Queue Processor is starting.");
            return base.StartAsync(cancellationToken);
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Job Queue Processor is stopping.");
            return base.StopAsync(cancellationToken);
        }
    }
}