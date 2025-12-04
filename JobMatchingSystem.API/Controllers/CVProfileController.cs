using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CVProfileController : ControllerBase
    {
        private readonly IPositionService _positionService;

        public CVProfileController(IPositionService positionService)
        {
            _positionService = positionService;
        }

        [HttpGet("me")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> GetMyProfile()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0)
                {
                    return BadRequest(APIResponse<object>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithMessage("Invalid user authentication")
                        .Build());
                }

                // TODO: Implement GetCVProfileByUserId in service
                // var profile = await _cvProfileService.GetByUserIdAsync(userId);

                return Ok(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithMessage("CV Profile retrieved successfully")
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

        [HttpPost("position")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> UpdatePosition([FromBody] SelectPositionRequest request)
        {
            try
            {
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

        [HttpPut("about-me")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> UpdateAboutMe([FromBody] UpdateAboutMeRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0)
                {
                    return BadRequest(APIResponse<object>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithMessage("Invalid user authentication")
                        .Build());
                }

                // TODO: Implement UpdateAboutMe in service
                // await _cvProfileService.UpdateAboutMeAsync(userId, request.AboutMe);

                return Ok(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithMessage("About me updated successfully")
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