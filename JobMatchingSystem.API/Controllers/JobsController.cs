using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public JobsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateJob([FromBody] CreateJobRequest request)
        {
            if (request == null)
                return BadRequest("Invalid request data.");

            var job = new Job
            {
                Title = request.Title,
                Description = request.Description,
                Requirements = request.Requirements,
                Benefits = request.Benefits,
                SalaryMin = request.SalaryMin,
                SalaryMax = request.SalaryMax,
                Location = request.Location,
                WorkInfo = request.WorkInfo,
                JobType = request.JobType,
                CompanyId = request.CompanyId,
                Poster = request.Poster,
                Status = JobStatus.Draft,
                CreatedAt = DateTime.UtcNow,
                OpenedAt = request.OpenedAt,
                ExpiredAt = request.ExpiredAt
            };

            _context.Jobs.Add(job);
            await _context.SaveChangesAsync();

            if (request.TaxonomyIds != null && request.TaxonomyIds.Any())
            {
                foreach (var taxonomyId in request.TaxonomyIds)
                {
                    var taxonomy = await _context.Taxonomies.FindAsync(taxonomyId);
                    if (taxonomy != null)
                    {
                        var entityTaxonomy = new EntityTaxonomy
                        {
                            EntityType = EntityType.Job,
                            EntityId = job.JobId,
                            TaxonomyId = taxonomy.TaxonomyId,
                            CreatedAt = DateTime.UtcNow
                        };
                        _context.EntityTaxonomies.Add(entityTaxonomy);
                    }
                }
                await _context.SaveChangesAsync();
            }

            var taxonomyNames = await _context.EntityTaxonomies
                .Where(et => et.EntityType == EntityType.Job && et.EntityId == job.JobId)
                .Include(et => et.Taxonomy)
                .Select(et => et.Taxonomy.Name)
                .ToListAsync();

            if (request.Stages != null && request.Stages.Any())
            {
                foreach (var s in request.Stages)
                {
                    var stage = new JobStage
                    {
                        JobId = job.JobId,
                        StageNumber = s.StageNumber,
                        Type = s.Type
                    };
                    _context.JobStages.Add(stage);
                }
                await _context.SaveChangesAsync();
            }

            var response = new JobResponse
            {
                JobId = job.JobId,
                Title = job.Title,
                Description = job.Description,
                Requirements = job.Requirements,
                Benefits = job.Benefits,
                SalaryMin = job.SalaryMin,
                SalaryMax = job.SalaryMax,
                Location = job.Location,
                WorkInfo = job.WorkInfo,
                JobType = job.JobType,
                Status = job.Status,
                CreatedAt = job.CreatedAt,
                OpenedAt = job.OpenedAt,
                ExpiredAt = job.ExpiredAt,
                Taxonomies = taxonomyNames
            };

            return Ok(response);
        }



        [HttpPut("censor")]
        public async Task<IActionResult> ApproveJob(int jobId, [FromBody] UpdateJobStatusRequest request)
        {
            var job = await _context.Jobs.FindAsync(jobId);
            if (job == null)
                return NotFound("Job not found.");

            var staff = await _context.Users.FindAsync(request.StaffId);
            if (staff == null)
                return NotFound("Staff not found.");

            if (request.Status != JobStatus.Moderated && request.Status != JobStatus.Rejected)
                return BadRequest("Invalid status. Only Moderated or Rejected allowed.");

            job.Status = request.Status;
            job.VerifiedBy = staff.Id;

            await _context.SaveChangesAsync();

            var response = new
            {
                job.JobId,
                Status = job.Status.ToString(),
                VerifiedBy = staff.FullName,
            };

            return Ok(response);
        }
    }
}

