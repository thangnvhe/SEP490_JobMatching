using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

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
        [HttpPut("{id}/result")]
        public async Task<IActionResult> UpdateResult(int id, [FromBody] UpdateResultCandidateStage request)
        {
            await _candidateStageService.UpdateResult(id, request);

            return Ok(APIResponse<string>.Builder()
                .WithResult("Update result thành công")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        [HttpPut("{id}/schedule")]
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
