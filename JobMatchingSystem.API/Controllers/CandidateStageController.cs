using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using Microsoft.AspNetCore.Authorization;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CandidateStageController : ControllerBase
    {
        private readonly ICandidateStageService _candidateStageService;

        public CandidateStageController(ICandidateStageService candidateStageService)
        {
            _candidateStageService = candidateStageService;
        }
        
        [HttpGet("jobStage/{jobStageId}")]
        [Authorize]
        public async Task<IActionResult> GetCandidateDetailsByJobStageId(int jobStageId)
        {
            var candidateDetails = await _candidateStageService.GetCandidateDetailsByJobStageId(jobStageId);
            
            return Ok(APIResponse<object>.Builder()
                .WithResult(candidateDetails)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetDetailById(int id)
        {
            var candidateStage = await _candidateStageService.GetDetailById(id);
            
            if (candidateStage == null)
            {
                return NotFound(APIResponse<string>.Builder()
                    .WithResult("Candidate stage not found")
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .Build());
            }
            
            return Ok(APIResponse<object>.Builder()
                .WithResult(candidateStage)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        
        [HttpPut("{id}/result")]
        [Authorize]
        public async Task<IActionResult> UpdateResult(int id, [FromBody] UpdateResultCandidateStage request)
        {
            var result = await _candidateStageService.UpdateResult(id, request);

            return Ok(APIResponse<CandidateStageDetailResponse>.Builder()
                .WithResult(result)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        [HttpPut("{id}/schedule")]
        [Authorize]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] UpdateCandidateStageRequest request)
        {
            await _candidateStageService.UpdateSchedule(id, request);

            return Ok(APIResponse<string>.Builder()
                .WithResult("Update schedule thành công")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
    }
}
