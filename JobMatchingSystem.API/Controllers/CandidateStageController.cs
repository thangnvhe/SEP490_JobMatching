using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;
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
                    .WithResult("Không tìm thấy giai đoạn ứng viên")
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

            if (result == null)
            {
                return NotFound(APIResponse<string>.Builder()
                    .WithResult("Không tìm thấy giai đoạn ứng viên")
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .Build());
            }

            return Ok(APIResponse<object>.Builder()
                .WithResult(result)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        [HttpPut("{id}/schedule")]
        [Authorize]
        public async Task<IActionResult> UpdateSchedule(int id, [FromBody] UpdateCandidateStageRequest request)
        {
            try
            {
                await _candidateStageService.UpdateSchedule(id, request);

                return Ok(APIResponse<string>.Builder()
                    .WithResult("Cập nhật lịch thành công")
                    .WithSuccess(true)
                    .WithStatusCode(HttpStatusCode.OK)
                    .Build());
            }
            catch (AppException ex)
            {
                return BadRequest(APIResponse<string>.Builder()
                    .WithResult(ex.Message)
                    .WithSuccess(false)
                    .WithStatusCode(ex.Error.StatusCode)
                    .Build());
            }
        }

        [HttpGet("hiring-manager")]
        [Authorize(Roles = "HiringManager")]
        public async Task<IActionResult> GetCandidatesForHiringManager(
            [FromQuery] int page = 1,
            [FromQuery] int size = 5,
            [FromQuery] string search = "",
            [FromQuery] string sortBy = "",
            [FromQuery] bool isDecending = false,
            [FromQuery] string status = "",
            [FromQuery] bool isHistory = false)
        {
            // Get current user ID from JWT claims
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int hiringManagerId))
            {
                return BadRequest(APIResponse<string>.Builder()
                    .WithResult("User ID không hợp lệ")
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.BadRequest)
                    .Build());
            }
            
            var candidates = await _candidateStageService.GetCandidatesForHiringManagerAsync(
                hiringManagerId, page, size, search, sortBy, isDecending, status, isHistory);
            
            return Ok(APIResponse<PagedResult<CandidateStageDetailResponse>>.Builder()
                .WithResult(candidates)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        [HttpPost("confirm/{token}")]
        public async Task<IActionResult> ConfirmInterview(string token)
        {
            try
            {
                var result = await _candidateStageService.ConfirmInterview(token);
                
                if (!result)
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithResult("Link đã hết hạn hoặc không hợp lệ. Vui lòng liên hệ nhà tuyển dụng.")
                        .WithSuccess(false)
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .Build());
                }
                
                return Ok(APIResponse<string>.Builder()
                    .WithResult("Đã xác nhận tham gia phỏng vấn thành công")
                    .WithSuccess(true)
                    .WithStatusCode(HttpStatusCode.OK)
                    .Build());
            }
            catch (AppException ex)
            {
                return BadRequest(APIResponse<string>.Builder()
                    .WithResult(ex.Message)
                    .WithSuccess(false)
                    .WithStatusCode(ex.Error.StatusCode)
                    .Build());
            }
        }

        [HttpPost("reject/{token}")]
        public async Task<IActionResult> RejectInterview(string token)
        {
            try
            {
                var result = await _candidateStageService.RejectInterview(token);
                
                if (!result)
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithResult("Link đã hết hạn hoặc không hợp lệ. Vui lòng liên hệ nhà tuyển dụng.")
                        .WithSuccess(false)
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .Build());
                }
                
                return Ok(APIResponse<string>.Builder()
                    .WithResult("Đã từ chối lịch phỏng vấn. Cảm ơn bạn đã phản hồi.")
                    .WithSuccess(true)
                    .WithStatusCode(HttpStatusCode.OK)
                    .Build());
            }
            catch (AppException ex)
            {
                return BadRequest(APIResponse<string>.Builder()
                    .WithResult(ex.Message)
                    .WithSuccess(false)
                    .WithStatusCode(ex.Error.StatusCode)
                    .Build());
            }
        }
    }
}
