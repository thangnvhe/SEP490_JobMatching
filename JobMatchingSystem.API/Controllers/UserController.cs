using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Security.Claims;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }
        [HttpGet]
        public async Task<ActionResult<PagedResult<UserDetailResponseDTO>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int size = 5,
        [FromQuery] string search = "",
        [FromQuery] string sortBy = "",
        [FromQuery] bool isDecending = false,
        [FromQuery] int? companyId = null,
        [FromQuery] string? role = null)
        {
            var result = await _userService.GetAllUser(page, size, search, sortBy, isDecending, companyId, role);
         return Ok(APIResponse<PagedResult<UserDetailResponseDTO>>.Builder()
        .WithResult(result)
        .WithStatusCode(HttpStatusCode.OK)
        .WithSuccess(true)
        .Build());
        }
        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.Unauthorized)
                    .WithSuccess(false)
                    .WithMessage("Không tìm thấy thông tin người dùng")
                    .Build());
            }

            var user = await _userService.GetCurrentUser(userIdClaim);

            return Ok(APIResponse<UserDetailResponseDTO>.Builder()
                .WithResult(user)
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .Build());
        }

        [HttpPut("me")]
        [Authorize]
        public async Task<IActionResult> UpdateCurrentUser([FromForm] UpdateCurrentUserRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (string.IsNullOrEmpty(userIdClaim))
            {
                return Unauthorized(APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.Unauthorized)
                    .WithSuccess(false)
                    .WithMessage("Không tìm thấy thông tin người dùng")
                    .Build());
            }

            var updatedUser = await _userService.UpdateCurrentUser(userIdClaim, request);

            return Ok(APIResponse<UserDetailResponseDTO>.Builder()
                .WithResult(updatedUser)
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithMessage("Cập nhật thông tin thành công")
                .Build());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _userService.GetUserById(id);

            return Ok(APIResponse<UserDetailResponseDTO>.Builder()
                .WithResult(user)
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .Build());
        }
        [HttpPut("{id}/status")]
        public async Task<IActionResult> ChangeStatus(int id)
        {
            await _userService.ChangeStatus(id);

            return Ok(APIResponse<string>.Builder()
                .WithResult("User status updated successfully")
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .Build());
        }

        [HttpPost("hiring-manager")]
        public async Task<IActionResult> CreateHiringManager([FromBody] CreateHiringManagerRequest request)
        {
            try
            {
                _logger.LogInformation("Creating hiring manager for email: {Email}, CompanyId: {CompanyId}", request.Email, request.CompanyId);
                
                var newUser = await _userService.CreateHiringManager(request);

                _logger.LogInformation("Successfully created hiring manager with ID: {UserId}", newUser.Id);

                return Ok(APIResponse<string>.Builder()
                    .WithResult("Tạo Hiring Manager thành công")
                    .WithStatusCode(HttpStatusCode.Created)
                    .WithSuccess(true)
                    .Build());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating hiring manager for email: {Email}", request?.Email);
                throw; // Re-throw to let global exception handler deal with it
            }
        }        
    }
}
