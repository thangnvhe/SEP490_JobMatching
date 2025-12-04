using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PositionController : ControllerBase
    {
        private readonly IPositionService _positionService;

        public PositionController(IPositionService positionService)
        {
            _positionService = positionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var positions = await _positionService.GetAllAsync();

            return Ok(APIResponse<IEnumerable<PositionResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(positions)
                .Build());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var position = await _positionService.GetByIdAsync(id);

            return Ok(APIResponse<PositionResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(position)
                .Build());
        }

        [HttpPost("candidate/select")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> SelectPositionByCandidate([FromBody] SelectPositionRequest request)
        {
            try
            {
                // Get current user ID from claims
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0)
                {
                    return BadRequest(APIResponse<object>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithMessage("Invalid user authentication")
                        .Build());
                }

                await _positionService.UpdateCandidatePositionAsync(userId, request.PositionId);

                return Ok(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithMessage("Position updated successfully")
                    .Build());
            }
            catch (Exception ex)
            {
                return BadRequest(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.BadRequest)
                    .WithSuccess(false)
                    .WithMessage(ex.Message)
                    .Build());
            }
        }
    }
}
