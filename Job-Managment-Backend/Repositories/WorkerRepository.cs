using Job_Managment_Backend.Data;
using Job_Managment_Backend.Models;
using Microsoft.EntityFrameworkCore;
using static Job_Managment_Backend.Models.Enums;

namespace Job_Managment_Backend.Repositories
{
    public class WorkerRepository
    {
        private readonly AppDbContext _context;
        private readonly ILogger<WorkerRepository> _logger;

        public WorkerRepository(AppDbContext context, ILogger<WorkerRepository> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<IEnumerable<Worker>> GetAllWorkersAsync()
        {
            try
            {
                return await _context.Workers.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all workers");
                throw;
            }
        }

        public async Task<Worker> GetWorkerByIdAsync(Guid id)
        {
            try
            {
                return await _context.Workers.FindAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving worker with ID: {WorkerId}", id);
                throw;
            }
        }

        public async Task AddWorkerAsync(Worker worker)
        {
            try
            {
                _context.Workers.Add(worker);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Added worker: {WorkerId}", worker.Id);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding worker: {WorkerId}", worker.Id);
                throw;
            }
        }

        public async Task UpdateWorkerAsync(Worker worker)
        {
            try
            {
                _context.Workers.Update(worker);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Updated worker: {WorkerId}, Status: {Status}",
                    worker.Id, worker.Status);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating worker: {WorkerId}", worker.Id);
                throw;
            }
        }

        public async Task<IEnumerable<Worker>> GetAvailableWorkersAsync()
        {
            try
            {
                return await _context.Workers.Where(w => w.Status == WorkerStatus.Available).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving available workers");
                throw;
            }
        }

        public async Task<IEnumerable<Worker>> GetWorkersByStatusAsync(WorkerStatus status)
        {
            try
            {
                return await _context.Workers
                    .Where(w => w.Status == status)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving workers with status: {Status}", status);
                throw;
            }
        }
    }
}
