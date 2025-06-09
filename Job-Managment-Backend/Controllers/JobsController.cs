using Job_Managment_Backend.DTOs;
using Job_Managment_Backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace Job_Managment_Backend.Controllers
{
    [ApiController]
    [Route("api/jobs")]
    public class JobsController : ControllerBase
    {
        private readonly JobService _jobService;
        private readonly ILogger<JobsController> _logger;

        public JobsController(JobService jobService, ILogger<JobsController> logger)
        {
            _jobService = jobService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetJobs()
        {
            try
            {
                _logger.LogInformation("Retrieving all jobs");
                var jobs = await _jobService.GetAllJobsAsync();
                return Ok(jobs);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving jobs: {Message}", ex.Message);
                return StatusCode(500, new JobResponse
                {
                    ErrorCode = "500",
                    ReturnMessage = "An error occurred while retrieving jobs."
                });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetJob(Guid id)
        {
            try
            {
                _logger.LogInformation("Retrieving job {JobId}", id);
                var job = await _jobService.GetJobByIdAsync(id);

                if (job == null)
                {
                    return NotFound(new JobResponse
                    {
                        ErrorCode = "404",
                        ReturnMessage = $"Job with ID {id} not found."
                    });
                }

                return Ok(job);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving job {JobId}: {Message}", id, ex.Message);
                return StatusCode(500, new JobResponse
                {
                    ErrorCode = "500",
                    ReturnMessage = "An error occurred while retrieving the job."
                });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateJob([FromBody] JobRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Name))
                {
                    _logger.LogWarning("Attempted to create job with empty name");
                    return BadRequest(new JobResponse
                    {
                        ErrorCode = "400",
                        ReturnMessage = "Job name is required."
                    });
                }

                var job = await _jobService.AddJobAsync(request);

                return Ok(new JobResponse
                {
                    JobId = job.Id,
                    ErrorCode = "200",
                    ReturnMessage = "Job created successfully."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating job: {Message}", ex.Message);
                return StatusCode(500, new JobResponse
                {
                    ErrorCode = "500",
                    ReturnMessage = "An error occurred while creating the job."
                });
            }
        }

        [HttpPost("stop/{id}")]
        public async Task<IActionResult> StopJob(Guid id)
        {
            try
            {
                _logger.LogInformation("Stopping job {JobId}", id);
                await _jobService.StopJobAsync(id);

                return Ok(new JobResponse
                {
                    JobId = id,
                    ErrorCode = "200",
                    ReturnMessage = "Job stopped successfully."
                });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new JobResponse
                {
                    JobId = id,
                    ErrorCode = "404",
                    ReturnMessage = $"Job with ID {id} not found."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new JobResponse
                {
                    JobId = id,
                    ErrorCode = "400",
                    ReturnMessage = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error stopping job {JobId}: {Message}", id, ex.Message);
                return StatusCode(500, new JobResponse
                {
                    ErrorCode = "500",
                    ReturnMessage = "An error occurred while stopping the job."
                });
            }
        }

        [HttpPost("retry/{id}")]
        public async Task<IActionResult> RetryJob(Guid id)
        {
            try
            {
                _logger.LogInformation("Retrying job {JobId}", id);
                await _jobService.RetryJobAsync(id);

                return Ok(new JobResponse
                {
                    JobId = id,
                    ErrorCode = "200",
                    ReturnMessage = "Job scheduled for retry."
                });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new JobResponse
                {
                    JobId = id,
                    ErrorCode = "404",
                    ReturnMessage = $"Job with ID {id} not found."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new JobResponse
                {
                    JobId = id,
                    ErrorCode = "400",
                    ReturnMessage = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrying job {JobId}: {Message}", id, ex.Message);
                return StatusCode(500, new JobResponse
                {
                    ErrorCode = "500",
                    ReturnMessage = "An error occurred while retrying the job."
                });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJob(Guid id)
        {
            try
            {
                _logger.LogInformation("Deleting job {JobId}", id);
                await _jobService.DeleteJobAsync(id);

                return Ok(new JobResponse
                {
                    JobId = id,
                    ErrorCode = "200",
                    ReturnMessage = "Job deleted successfully."
                });
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new JobResponse
                {
                    JobId = id,
                    ErrorCode = "404",
                    ReturnMessage = $"Job with ID {id} not found."
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new JobResponse
                {
                    JobId = id,
                    ErrorCode = "400",
                    ReturnMessage = ex.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting job {JobId}: {Message}", id, ex.Message);
                return StatusCode(500, new JobResponse
                {
                    ErrorCode = "500",
                    ReturnMessage = "An error occurred while deleting the job."
                });
            }
        }
    }
}
