using Job_Managment_Backend.Models;
using static Job_Managment_Backend.Models.Enums;
using Job_Managment_Backend.Repositories;
using Job_Managment_Backend.Hubs;
using Microsoft.AspNetCore.SignalR;
using Job_Managment_Backend.DTOs;

namespace Job_Managment_Backend.Services
{
    public class JobService
    {
        private readonly JobRepository _jobRepository;
        private readonly WorkerRepository _workerRepository;
        private readonly NotificationService _notificationService;
        private readonly IHubContext<JobHub> _jobHub;
        private readonly ILogger<JobService> _logger;

        public JobService(
            JobRepository jobRepository,
            WorkerRepository workerRepository,
            NotificationService notificationService,
            IHubContext<JobHub> jobHub,
            ILogger<JobService> logger)
        {
            _jobRepository = jobRepository;
            _workerRepository = workerRepository;
            _notificationService = notificationService;
            _jobHub = jobHub;
            _logger = logger;
        }

        public async Task<IEnumerable<Job>> GetAllJobsAsync()
        {
            return await _jobRepository.GetAllJobsAsync();
        }

        public async Task<Job> GetJobByIdAsync(Guid id)
        {
            return await _jobRepository.GetJobByIdAsync(id);
        }

        public async Task<Job> AddJobAsync(JobRequest request)
        {
            var job = Job.Create(
                request.Name,
                request.Priority,
                request.ScheduledStartTime
            );

            await _jobRepository.AddJobAsync(job);
            // Use notification service for consistency
            await _notificationService.NotifyJobUpdate(job);

            _logger.LogInformation("Job {JobId} added and clients notified", job.Id);

            return job;
        }

        public async Task UpdateJobAsync(Job job)
        {
            await _jobRepository.UpdateJobAsync(job);
            // Use notification service for consistency
            await _notificationService.NotifyJobUpdate(job);

            _logger.LogInformation("Job {JobId} updated: Status={Status}, Progress={Progress}", job.Id, job.Status, job.Progress);
        }

        public async Task DeleteJobAsync(Guid jobId)
        {
            var job = await _jobRepository.GetJobByIdAsync(jobId);
            if (job == null)
            {
                throw new KeyNotFoundException($"Job with ID {jobId} not found");
            }

            if (job.Status == JobStatus.InProgress)
            {
                throw new InvalidOperationException("Cannot delete a job that is in progress");
            }

            await _jobRepository.DeleteJobAsync(job);
            await _jobHub.Clients.All.SendAsync("JobDeleted", jobId);

            _logger.LogInformation("Job {JobId} deleted and clients notified", jobId);
        }

        public async Task StopJobAsync(Guid jobId)
        {
            var job = await _jobRepository.GetJobByIdAsync(jobId);
            if (job == null)
            {
                throw new KeyNotFoundException($"Job with ID {jobId} not found");
            }

            if (job.Status != JobStatus.InProgress)
            {
                throw new InvalidOperationException("Only in-progress jobs can be stopped");
            }

            job.Status = JobStatus.Stopped;
            job.EndTime = DateTime.UtcNow;

            await _jobRepository.UpdateJobAsync(job);
            await _notificationService.NotifyJobUpdate(job);

            // Check if the job has an assigned worker
            if (job.WorkerId.HasValue)
            {
                try
                {
                    var worker = await _workerRepository.GetWorkerByIdAsync(job.WorkerId.Value);

                    if (worker != null)
                    {
                        worker.Status = WorkerStatus.Available;
                        worker.CurrentJobId = null;
                        await _workerRepository.UpdateWorkerAsync(worker);

                        // Notify about worker status change
                        await _notificationService.NotifyWorkerUpdate(worker);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error freeing worker for stopped job {JobId}", jobId);
                }
            }

            _logger.LogInformation("Job {JobId} stopped and worker freed", jobId);
        }

        public async Task RetryJobAsync(Guid jobId)
        {
            var job = await _jobRepository.GetJobByIdAsync(jobId);
            if (job == null)
            {
                throw new KeyNotFoundException($"Job with ID {jobId} not found");
            }

            if (job.Status != JobStatus.Failed && job.Status != JobStatus.Stopped)
            {
                throw new InvalidOperationException("Only failed or stopped jobs can be retried");
            }

            job.Status = JobStatus.Pending;
            job.Progress = 0;
            job.ScheduledStartTime = DateTime.UtcNow;
            job.RetryCount++;
            job.ErrorMessage = null;
            job.ActualStartTime = null;
            job.EndTime = null;

            await _jobRepository.UpdateJobAsync(job);
            // Use notification service for consistency
            await _notificationService.NotifyJobUpdate(job);

            _logger.LogInformation("Job {JobId} scheduled for retry (attempt {RetryCount})", jobId, job.RetryCount);
        }

        public async Task MarkJobFailedAsync(Guid jobId, string errorMessage)
        {
            var job = await _jobRepository.GetJobByIdAsync(jobId);
            if (job == null)
            {
                throw new KeyNotFoundException($"Job with ID {jobId} not found");
            }

            job.Status = JobStatus.Failed;
            job.EndTime = DateTime.UtcNow;
            job.ErrorMessage = errorMessage;

            await _jobRepository.UpdateJobAsync(job);
            // Use notification service for consistency
            await _notificationService.NotifyJobUpdate(job);

            _logger.LogError("Job {JobId} failed: {ErrorMessage}", jobId, errorMessage);
        }

        public async Task<Job> GetNextPendingJobAsync()
        {
            var pendingJobs = await _jobRepository.GetPendingJobsAsync();
            if (!pendingJobs.Any())
            {
                return null;
            }

            // Jobs are already ordered by priority from the repository
            return pendingJobs.First();
        }
    }
}