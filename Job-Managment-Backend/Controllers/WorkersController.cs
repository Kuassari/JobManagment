using Job_Managment_Backend.DTOs;
using Job_Managment_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Job_Managment_Backend.Controllers
{
    [ApiController]
    [Route("api/workers")]
    public class WorkersController : ControllerBase
    {
        private readonly WorkerService _workerService;
        private readonly ILogger<WorkersController> _logger;

        public WorkersController(WorkerService workerService, ILogger<WorkersController> logger)
        {
            _workerService = workerService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetWorkers()
        {
            try
            {
                _logger.LogInformation("Retrieving all workers");
                var workers = await _workerService.GetAllWorkersAsync();
                return Ok(workers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving workers: {Message}", ex.Message);
                return StatusCode(500, new WorkerResponse
                {
                    ErrorCode = "500",
                    ReturnMessage = "An error occurred while retrieving workers."
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetWorker(Guid id)
        {
            try
            {
                _logger.LogInformation("Retrieving worker {WorkerId}", id);
                var worker = await _workerService.GetWorkerByIdAsync(id);

                if (worker == null)
                {
                    return NotFound(new WorkerResponse
                    {
                        ErrorCode = "404",
                        ReturnMessage = $"Worker with ID {id} not found."
                    });
                }

                return Ok(worker);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving worker {WorkerId}: {Message}", id, ex.Message);
                return StatusCode(500, new WorkerResponse
                {
                    ErrorCode = "500",
                    ReturnMessage = "An error occurred while retrieving the worker."
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> RegisterWorker([FromBody] WorkerRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    _logger.LogWarning("Attempted to register worker with empty name");
                    return BadRequest(new WorkerResponse
                    {
                        ErrorCode = "400",
                        ReturnMessage = "Worker name is required."
                    });
                }

                var worker = await _workerService.AddWorkerAsync(request);

                return Ok(new WorkerResponse
                {
                    WorkerId = worker.Id,
                    ErrorCode = "200",
                    ReturnMessage = "Worker registered successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering worker: {Message}", ex.Message);
                return StatusCode(500, new WorkerResponse
                {
                    ErrorCode = "500",
                    ReturnMessage = "An error occurred while registering the worker."
                });
            }
        }

        [HttpPost("process-queue")]
        public async Task<IActionResult> ProcessQueue()
        {
            try
            {
                _logger.LogInformation("Manually triggering job queue processing");
                await _workerService.TryAssignPendingJobsAsync();

                return Ok(new
                {
                    ErrorCode = "200",
                    ReturnMessage = "Job queue processing triggered successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing job queue: {Message}", ex.Message);
                return StatusCode(500, new
                {
                    ErrorCode = "500",
                    ReturnMessage = "An error occurred while processing the job queue."
                });
            }
        }
    }
}
