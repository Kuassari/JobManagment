using Job_Managment_Backend.DTOs;
using Job_Managment_Backend.Hubs;
using Job_Managment_Backend.Models;
using Job_Managment_Backend.Repositories;
using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading;
using static Job_Managment_Backend.Models.Enums;

namespace Job_Managment_Backend.Services
{
    public class WorkerService
    {
        private readonly WorkerRepository _workerRepository;
        private readonly JobRepository _jobRepository;
        private readonly NotificationService _notificationService;
        private readonly IHubContext<WorkerHub> _workerHub;
        private readonly IHubContext<JobHub> _jobHub;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<WorkerService> _logger;
        private readonly SemaphoreSlim _jobProcessingSemaphore;

        // Track running jobs to allow cancellation
        private readonly ConcurrentDictionary<Guid, CancellationTokenSource> _jobCancellationTokens = new();

        public WorkerService(
            WorkerRepository workerRepository,
            JobRepository jobRepository,
            NotificationService notificationService,
            IHubContext<WorkerHub> workerHub,
            IHubContext<JobHub> jobHub,
            IServiceProvider serviceProvider,
            ILogger<WorkerService> logger)
        {
            _workerRepository = workerRepository;
            _jobRepository = jobRepository;
            _notificationService = notificationService;
            _workerHub = workerHub;
            _jobHub = jobHub;
            _serviceProvider = serviceProvider;
            _logger = logger;
            // Allow up to 10 concurrent job executions
            _jobProcessingSemaphore = new SemaphoreSlim(10, 10);
        }

        public async Task<IEnumerable<Worker>> GetAllWorkersAsync()
        {
            return await _workerRepository.GetAllWorkersAsync();
        }

        public async Task<Worker> GetWorkerByIdAsync(Guid id)
        {
            return await _workerRepository.GetWorkerByIdAsync(id);
        }

        public async Task<Worker> AddWorkerAsync(WorkerRequest request)
        {
            var worker = new Worker
            {
                Id = Guid.NewGuid(),
                Name = request.Name,
                Status = WorkerStatus.Available
            };

            await _workerRepository.AddWorkerAsync(worker);
            await _notificationService.NotifyWorkerUpdate(worker);

            _logger.LogInformation("Worker {WorkerId} added and clients notified", worker.Id);

            // Check if there are any pending jobs that can be assigned
            await TryAssignPendingJobsAsync();

            return worker;
        }

        public async Task UpdateWorkerAsync(Worker worker)
        {
            await _workerRepository.UpdateWorkerAsync(worker);
            await _notificationService.NotifyWorkerUpdate(worker);

            _logger.LogInformation("Worker {WorkerId} updated: Status={Status}", worker.Id, worker.Status);
        }

        public async Task<IEnumerable<Worker>> GetAvailableWorkersAsync()
        {
            return await _workerRepository.GetAvailableWorkersAsync();
        }

        public async Task TryAssignPendingJobsAsync()
        {
            try
            {
                _logger.LogInformation("Checking for pending jobs to assign to available workers");

                // Get available workers
                var availableWorkers = await GetAvailableWorkersAsync();
                if (!availableWorkers.Any())
                {
                    _logger.LogInformation("No available workers found");
                    return;
                }

                // Get all pending jobs
                var pendingJobs = await _jobRepository.GetPendingJobsAsync();
                if (!pendingJobs.Any())
                {
                    _logger.LogInformation("No pending jobs found");
                    return;
                }

                // Group jobs by priority
                var highPriorityJobs = pendingJobs.Where(j => j.Priority == JobPriority.High).ToList();
                var regularPriorityJobs = pendingJobs.Where(j => j.Priority == JobPriority.Regular).ToList();
                var lowPriorityJobs = pendingJobs.Where(j => j.Priority == JobPriority.Low).ToList();

                _logger.LogInformation("Found {HighCount} high priority jobs, {RegularCount} regular jobs, and {LowCount} low priority jobs",
                    highPriorityJobs.Count, regularPriorityJobs.Count, lowPriorityJobs.Count);

                // Create a collection to track concurrent assignment tasks
                var assignmentTasks = new List<Task>();

                // Process each available worker
                foreach (var worker in availableWorkers)
                {
                    Job jobToAssign = null;

                    // First try to assign a high priority job
                    if (highPriorityJobs.Any())
                    {
                        jobToAssign = highPriorityJobs.First();
                        highPriorityJobs.RemoveAt(0);
                    }
                    // If no high priority jobs, try regular priority
                    else if (regularPriorityJobs.Any())
                    {
                        jobToAssign = regularPriorityJobs.First();
                        regularPriorityJobs.RemoveAt(0);
                    }
                    // If no regular priority jobs, try low priority
                    else if (lowPriorityJobs.Any())
                    {
                        jobToAssign = lowPriorityJobs.First();
                        lowPriorityJobs.RemoveAt(0);
                    }

                    // If we found a job to assign
                    if (jobToAssign != null)
                    {
                        // Start assignment in parallel
                        var workerGuid = worker.Id;
                        var jobGuid = jobToAssign.Id;

                        // Create a task for this assignment but don't await it here
                        var assignmentTask = Task.Run(async () =>
                        {
                            try
                            {
                                await AssignJobToWorkerAsync(workerGuid, jobGuid);
                            }
                            catch (Exception ex)
                            {
                                _logger.LogError(ex, "Failed to assign job {JobId} to worker {WorkerId}", jobGuid, workerGuid);
                            }
                        });

                        assignmentTasks.Add(assignmentTask);
                    }
                }

                // If we have any assignment tasks, wait for them all to complete
                if (assignmentTasks.Any())
                {
                    await Task.WhenAll(assignmentTasks);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error assigning pending jobs to workers");
            }
        }

        public async Task AssignJobToWorkerAsync(Guid workerId, Guid jobId)
        {
            // Use a semaphore to ensure we don't exceed max concurrent job assignments
            await _jobProcessingSemaphore.WaitAsync();

            try
            {
                var worker = await _workerRepository.GetWorkerByIdAsync(workerId);
                if (worker == null)
                {
                    throw new KeyNotFoundException($"Worker with ID {workerId} not found");
                }

                var job = await _jobRepository.GetJobByIdAsync(jobId);
                if (job == null)
                {
                    throw new KeyNotFoundException($"Job with ID {jobId} not found");
                }

                if (worker.Status != WorkerStatus.Available)
                {
                    throw new InvalidOperationException($"Worker {workerId} is not available");
                }

                if (job.Status != JobStatus.Pending)
                {
                    throw new InvalidOperationException($"Job {jobId} is not pending");
                }

                try
                {
                    _logger.LogInformation("Assigning job {JobId} to worker {WorkerId}", jobId, workerId);

                    worker.Status = WorkerStatus.Busy;
                    worker.CurrentJobId = jobId;
                    await _workerRepository.UpdateWorkerAsync(worker);

                    job.Status = JobStatus.InProgress;
                    job.ActualStartTime = DateTime.UtcNow;
                    job.Progress = 0;
                    job.WorkerId = workerId;
                    await _jobRepository.UpdateJobAsync(job);

                    // Use notification service for consistent updates
                    await _notificationService.NotifyWorkerUpdate(worker);
                    await _notificationService.NotifyJobUpdate(job);

                    // Create a cancellation token for this job that can be used to stop it
                    var cts = new CancellationTokenSource();
                    _jobCancellationTokens[jobId] = cts;

                    // Execute the job in the background
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await ExecuteJobAsync(worker, job, cts.Token);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Unhandled exception in job execution for job {JobId}", job.Id);

                            // Attempt to mark job as failed
                            try
                            {
                                job.Status = JobStatus.Failed;
                                job.EndTime = DateTime.UtcNow;
                                job.ErrorMessage = $"Execution error: {ex.Message}";
                                await _jobRepository.UpdateJobAsync(job);
                                await _notificationService.NotifyJobUpdate(job);
                            }
                            catch (Exception updateEx)
                            {
                                _logger.LogCritical(
                                    updateEx,
                                    "Failed to update job status after execution error for job {JobId}",
                                    job.Id
                                );
                            }
                        }
                        finally
                        {
                            // Clean up the cancellation token
                            _jobCancellationTokens.TryRemove(jobId, out _);
                        }
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error assigning job {JobId} to worker {WorkerId}", jobId, workerId);

                    try
                    {
                        worker.Status = WorkerStatus.Available;
                        worker.CurrentJobId = null;
                        await _workerRepository.UpdateWorkerAsync(worker);

                        job.Status = JobStatus.Pending;
                        await _jobRepository.UpdateJobAsync(job);

                        _logger.LogInformation("Recovered from assignment error for job {JobId}", job.Id);
                    }
                    catch (Exception recoveryEx)
                    {
                        _logger.LogError(recoveryEx, "Error recovering from job assignment failure");
                    }

                    throw;
                }
            }
            finally
            {
                _jobProcessingSemaphore.Release();
            }
        }

        private async Task ExecuteJobAsync(Worker worker, Job job, CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Starting execution of job {JobId} on worker {WorkerId}", job.Id, worker.Id);

                // Simulate job execution with progress updates
                for (int i = 0; i <= 100; i += 10)
                {
                    // Check for cancellation
                    if (cancellationToken.IsCancellationRequested)
                    {
                        _logger.LogInformation("Job {JobId} execution was cancelled", job.Id);
                        break;
                    }

                    // Refetch job to check current status - important for stop functionality
                    var currentJob = await _jobRepository.GetJobByIdAsync(job.Id);

                    // Stop execution if job is no longer in progress
                    if (currentJob.Status != JobStatus.InProgress)
                    {
                        _logger.LogInformation("Job {JobId} was externally changed to {Status}, stopping execution", job.Id, currentJob.Status);
                        break;
                    }

                    // Update progress
                    job.Progress = i;
                    await _jobRepository.UpdateJobAsync(job);

                    // Use notification service for real-time updates
                    await _notificationService.NotifyJobUpdate(job);

                    // Simulate work
                    await Task.Delay(1000, cancellationToken);
                }

                // If cancelled, don't update the job
                if (cancellationToken.IsCancellationRequested)
                {
                    return;
                }

                // Refetch job to ensure we have latest status
                job = await _jobRepository.GetJobByIdAsync(job.Id);

                // Only mark as completed if still in progress
                if (job.Status == JobStatus.InProgress)
                {
                    job.Status = JobStatus.Completed;
                    job.EndTime = DateTime.UtcNow;
                    job.Progress = 100;
                    await _jobRepository.UpdateJobAsync(job);
                    await _notificationService.NotifyJobUpdate(job);
                    _logger.LogInformation("Job {JobId} completed successfully on worker {WorkerId}", job.Id, worker.Id);
                }

                // Free up worker
                await FreeWorkerAfterJobCompletion(worker, job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error executing job {JobId} on worker {WorkerId}", job.Id, worker.Id);

                // Handle job failure
                await HandleJobFailure(worker, job, ex);
            }
        }

        private async Task FreeWorkerAfterJobCompletion(Worker worker, Job job)
        {
            // Free up worker
            worker.Status = WorkerStatus.Available;
            worker.CurrentJobId = null;
            await _workerRepository.UpdateWorkerAsync(worker);
            await _notificationService.NotifyWorkerUpdate(worker);

            // Check if there are more jobs to process
            await TryAssignPendingJobsAsync();
        }

        private async Task HandleJobFailure(Worker worker, Job job, Exception ex)
        {
            // Mark job as failed
            job.Status = JobStatus.Failed;
            job.EndTime = DateTime.UtcNow;
            job.ErrorMessage = $"Execution error: {ex.Message}";
            await _jobRepository.UpdateJobAsync(job);
            await _notificationService.NotifyJobUpdate(job);

            // Free up worker
            worker.Status = WorkerStatus.Available;
            worker.CurrentJobId = null;
            await _workerRepository.UpdateWorkerAsync(worker);
            await _notificationService.NotifyWorkerUpdate(worker);

            // Check if there are more jobs to process
            await TryAssignPendingJobsAsync();
        }
    }
}