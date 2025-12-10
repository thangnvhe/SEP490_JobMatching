using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class InvitationController : ControllerBase
    {
        private readonly IEmailService _emailService;
        private readonly IJobService _jobService;
        private readonly ICompanyService _companyService;
        private readonly IConfiguration _configuration;

        public InvitationController(
            IEmailService emailService,
            IJobService jobService,
            ICompanyService companyService,
            IConfiguration configuration)
        {
            _emailService = emailService;
            _jobService = jobService;
            _companyService = companyService;
            _configuration = configuration;
        }

        [HttpPost("invite-candidate")]
        [Authorize(Roles = "Recruiter,HiringManager")]
        public async Task<IActionResult> InviteCandidate([FromBody] InviteCandidateRequest request)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
                
                // Get job details
                var job = await _jobService.GetJobByIdAsync(request.JobId, userId);
                if (job == null)
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithResult("Không tìm thấy công việc")
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .Build());
                }

                // Get company details
                var company = await _companyService.GetDetailCompany(job.CompanyId);
                var companyName = company?.Name ?? "Công ty";

                // Create job application URL
                var frontendBaseUrl = _configuration["Frontend:BaseUrl"];
                var jobApplicationUrl = $"{frontendBaseUrl}/jobs/{request.JobId}";

                // Send invitation email
                await _emailService.SendJobInvitationEmailAsync(
                    request.CandidateEmail,
                    job.Title,
                    companyName,
                    jobApplicationUrl,
                    request.Message
                );

                return Ok(APIResponse<string>.Builder()
                    .WithResult("Đã gửi email mời ứng tuyển thành công")
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .Build());
            }
            catch (Exception ex)
            {
                return StatusCode(500, APIResponse<string>.Builder()
                    .WithResult($"Lỗi server: {ex.Message}")
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .WithSuccess(false)
                    .Build());
            }
        }
    }
}