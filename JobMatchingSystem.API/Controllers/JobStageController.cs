using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JobStageController : ControllerBase
    {
        private readonly IJobStageService _service;

        public JobStageController(IJobStageService service)
        {
            _service = service;
        }

        [HttpGet("by-job/{jobId}")]
        public async Task<IActionResult> GetByJobId(int jobId)
        {
            var stages = await _service.GetByJobIdAsync(jobId);

            return Ok(APIResponse<List<JobStageResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(stages)
                .Build());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var stage = await _service.GetByIdAsync(id);

            if (stage == null)
                return NotFound();

            return Ok(APIResponse<JobStageResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(stage)
                .Build());
        }

        // CREATE
        [HttpPost]
        [Authorize(Roles = "Recruiter,HiringManager")]
        public async Task<IActionResult> Create([FromBody] JobStageRequest request)
        {
            await _service.CreateAsync(request);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .WithResult("Job stage created successfully")
                .Build());
        }

        // UPDATE
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Recruiter,HiringManager")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateJobStageRequest request)
        {
            await _service.UpdateAsync(id, request);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Job stage updated successfully")
                .Build());
        }

        // DELETE
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Recruiter,HiringManager")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Job stage deleted successfully")
                .Build());
        }
    }
}
