using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;
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
        private readonly ICVProfileService _cvProfileService;

        public CVProfileController(ICVProfileService cvProfileService)
        {
            _cvProfileService = cvProfileService;
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var cvProfile = await _cvProfileService.GetByIdAsync(id);
                if (cvProfile == null)
                {
                    return NotFound(APIResponse<object>.Builder()
                        .WithStatusCode(HttpStatusCode.NotFound)
                        .WithSuccess(false)
                        .WithMessage("CV Profile not found")
                        .Build());
                }

                return Ok(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(cvProfile)
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

        [HttpGet("me")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> GetMyProfile()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0)
                {
                    return Ok(APIResponse<CVProfileDto>.Builder()
                        .WithStatusCode(HttpStatusCode.OK)
                        .WithSuccess(true)
                        .WithResult(new CVProfileDto())
                        .Build());
                }

                var profile = await _cvProfileService.GetByUserIdAsync(userId);
                if (profile == null)
                {
                    return Ok(APIResponse<CVProfileDto>.Builder()
                        .WithStatusCode(HttpStatusCode.OK)
                        .WithSuccess(true)
                        .WithResult(new CVProfileDto())
                        .Build());
                }

                var profileDto = new CVProfileDto
                {
                    PositionId = profile.PositionId,
                    AboutMe = profile.AboutMe,
                    PositionName = profile.Position?.Name
                };

                return Ok(APIResponse<CVProfileDto>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(profileDto)
                    .Build());
            }
            catch (Exception)
            {
                return Ok(APIResponse<CVProfileDto>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(new CVProfileDto())
                    .Build());
            }
        }

        [HttpPost]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Create([FromBody] CVProfileRequest request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0)
                {
                    return BadRequest(APIResponse<object>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithMessage("Invalid user authentication")
                        .Build());
                }
                
                var cvProfile = await _cvProfileService.CreateAsync(request, userId);
                
                return Ok(APIResponse<CVProfile>.Builder()
                    .WithStatusCode(HttpStatusCode.Created)
                    .WithSuccess(true)
                    .WithResult(cvProfile)
                    .Build());
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
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

        [HttpPut("{id}")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Update(int id, [FromBody] CVProfileRequest request)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                if (userId == 0)
                {
                    return BadRequest(APIResponse<object>.Builder()
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .WithMessage("Invalid user authentication")
                        .Build());
                }
                
                var updatedProfile = await _cvProfileService.UpdateAsync(id, request, userId);
                
                return Ok(APIResponse<CVProfile>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(updatedProfile)
                    .Build());
            }
            catch (KeyNotFoundException)
            {
                return NotFound(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .WithSuccess(false)
                    .WithMessage("CV Profile not found")
                    .Build());
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                await _cvProfileService.DeleteAsync(id, userId);
                
                return Ok(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .Build());
            }
            catch (KeyNotFoundException)
            {
                return NotFound(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .WithSuccess(false)
                    .WithMessage("CV Profile not found")
                    .Build());
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
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

                // Get existing profile or create a new one
                var existingProfile = await _cvProfileService.GetByUserIdAsync(userId);
                if (existingProfile == null)
                {
                    // Create new profile if it doesn't exist
                    var createRequest = new CVProfileRequest
                    {
                        PositionId = request.PositionId,
                        AboutMe = null
                    };
                    await _cvProfileService.CreateAsync(createRequest, userId);
                }
                else
                {
                    // Update existing profile's position
                    var updateRequest = new CVProfileRequest
                    {
                        PositionId = request.PositionId,
                        AboutMe = existingProfile.AboutMe
                    };
                    await _cvProfileService.UpdateAsync(existingProfile.Id, updateRequest, userId);
                }

                return Ok(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
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

        [HttpPatch("about-me")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> UpdateAboutMe([FromBody] string aboutMe)
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

                var updatedProfile = await _cvProfileService.UpdateAboutMeAsync(userId, aboutMe);

                return Ok(APIResponse<CVProfile>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(updatedProfile)
                    .Build());
            }
            catch (KeyNotFoundException)
            {
                return NotFound(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .WithSuccess(false)
                    .WithMessage("CV Profile not found")
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