using Job_Managment_Backend.Data;
using Job_Managment_Backend.Models;
using Microsoft.EntityFrameworkCore;
using static Job_Managment_Backend.Models.Enums;


namespace Job_Managment_Backend.Repositories
{
    public class JobRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<JobRepository> _logger;

        public JobRepository(AppDbContext context, ILogger<JobRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Job>> GetAllJobsAsync()
        {
            try
            {
                return await _context.Jobs.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all jobs");
                throw;
            }
        }

        public async Task<Job> GetJobByIdAsync(Guid id)
        {
            try
            {
                return await _context.Jobs.FindAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving job with ID: {JobId}", id);
                throw;
            }
        }

        public async Task AddJobAsync(Job job)
        {
            try
            {
                _context.Jobs.Add(job);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Added job: {JobId}", job.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding job: {JobId}", job.Id);
                throw;
            }
        }

        public async Task UpdateJobAsync(Job job)
        {
            try
            {
                _context.Jobs.Update(job);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Updated job: {JobId}, Status: {Status}, Progress: {Progress}", job.Id, job.Status, job.Progress);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating job: {JobId}", job.Id);
                throw;
            }
        }

        public async Task DeleteJobAsync(Job job)
        {
            try
            {
                _context.Jobs.Remove(job);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Deleted job: {JobId}", job.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting job: {JobId}", job.Id);
                throw;
            }
        }

        public async Task<IEnumerable<Job>> GetPendingJobsAsync()
        {
            try
            {
                var now = DateTime.UtcNow;
                return await _context.Jobs
                    .Where(j => j.Status == JobStatus.Pending && j.ScheduledStartTime <= now)
                    .OrderBy(j => j.Priority) // Order by enum value (High=0, Regular=1, Low=2)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving pending jobs");
                throw;
            }
        }

        public async Task<IEnumerable<Job>> GetJobsByStatusAsync(JobStatus status)
        {
            try
            {
                return await _context.Jobs
                    .Where(j => j.Status == status)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving jobs with status: {Status}", status);
                throw;
            }
        }
    }
}
