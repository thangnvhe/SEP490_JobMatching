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
    public class CandidateProfileController : ControllerBase
    {
        private readonly ICandidateProfileService _profileService;

        public CandidateProfileController(ICandidateProfileService profileService)
        {
            _profileService = profileService;
        }

        [HttpGet]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var profile = await _profileService.GetProfileByUserIdAsync(userId);

            if (profile == null)
            {
                return NotFound(APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .WithSuccess(false)
                    .WithResult("Profile not found")
                    .Build());
            }

            return Ok(APIResponse<CandidateProfileResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(profile)
                .Build());
        }

        [HttpPost]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> CreateProfile([FromBody] CreateOrUpdateCandidateProfileRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _profileService.CreateProfileAsync(request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Candidate profile saved successfully")
                .Build());
        }

        [HttpPut]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> UpdateProfile([FromBody] CreateOrUpdateCandidateProfileRequest request)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _profileService.UpdateProfileAsync(request, userId);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Candidate profile saved successfully")
                .Build());
        }

    }

}
