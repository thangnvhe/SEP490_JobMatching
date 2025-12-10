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
        [Authorize(Roles = "Admin, Recruiter")]
        public async Task<ActionResult<PagedResult<UserDetailResponseDTO>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int size = 5,
        [FromQuery] string search = "",
        [FromQuery] string sortBy = "",
        [FromQuery] bool isDecending = false,
        [FromQuery] int? companyId = null,
        [FromQuery] string? role = null,
        [FromQuery] bool? isActive = null)
        {
            var result = await _userService.GetAllUser(page, size, search, sortBy, isDecending, companyId, role, isActive);
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
            try
            {
                // Validate avatar file if provided
                if (request.AvatarFile != null)
                {
                    var validationError = ValidateAvatarFile(request.AvatarFile);
                    if (!string.IsNullOrEmpty(validationError))
                    {
                        return BadRequest(APIResponse<string>.Builder()
                            .WithStatusCode(HttpStatusCode.BadRequest)
                            .WithSuccess(false)
                            .WithMessage(validationError)
                            .Build());
                    }
                }

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
            catch (Exception ex)
            {
                return StatusCode(500, APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .WithSuccess(false)
                    .WithMessage($"Cập nhật thất bại: {ex.Message}")
                    .Build());
            }
        }

        [HttpGet("{id}")]
        [Authorize(Roles = "Admin, Recruiter")]
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
        [Authorize(Roles = "Admin, Recruiter")]
        public async Task<IActionResult> ChangeStatus(int id)
        {
            await _userService.ChangeStatus(id);

            return Ok(APIResponse<string>.Builder()
                .WithResult("User status updated successfully")
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .Build());
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserByAdmin(int id, [FromForm] UpdateUserByAdminRequest request)
        {
            try
            {
                // Validate avatar file if provided
                if (request.avatarFile != null)
                {
                    var validationError = ValidateAvatarFile(request.avatarFile);
                    if (!string.IsNullOrEmpty(validationError))
                    {
                        return BadRequest(APIResponse<string>.Builder()
                            .WithStatusCode(HttpStatusCode.BadRequest)
                            .WithSuccess(false)
                            .WithMessage(validationError)
                            .Build());
                    }
                }

                var updatedUser = await _userService.UpdateUserByAdmin(id, request);

                return Ok(APIResponse<UserDetailResponseDTO>.Builder()
                    .WithResult(updatedUser)
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithMessage("Cập nhật thông tin user thành công")
                    .Build());
            }
            catch (Exception ex)
            {
                return StatusCode(500, APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.InternalServerError)
                    .WithSuccess(false)
                    .WithMessage($"Cập nhật user thất bại: {ex.Message}")
                    .Build());
            }
        }

        [HttpPost("hiring-manager")]
        [Authorize(Roles = "Recruiter")]
        public async Task<IActionResult> CreateHiringManager([FromBody] CreateHiringManagerRequest request)
        {
            try
            {
                _logger.LogInformation("Creating hiring manager for email: {Email}, CompanyId: {CompanyId}", request.Email, request.CompanyId);
                
                // Get current recruiter's userId and companyId
                var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int recruiterId))
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithResult("Không thể xác định thông tin người dùng")
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .Build());
                }
                
                var recruiter = await _userService.GetUserById(recruiterId);
                if (recruiter?.CompanyId == null)
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithResult("Recruiter không thuộc công ty nào")
                        .WithStatusCode(HttpStatusCode.BadRequest)
                        .WithSuccess(false)
                        .Build());
                }
                
                // Validate that recruiter can only create hiring manager for their own company
                if (recruiter.CompanyId != request.CompanyId)
                {
                    return BadRequest(APIResponse<string>.Builder()
                        .WithResult("Bạn chỉ có thể tạo Hiring Manager cho công ty của mình")
                        .WithStatusCode(HttpStatusCode.Forbidden)
                        .WithSuccess(false)
                        .Build());
                }
                
                var newUser = await _userService.CreateHiringManager(request);

                _logger.LogInformation("Successfully created hiring manager with ID: {UserId}", newUser.Id);

                var responseMessage = $"Tạo Hiring Manager thành công! Thông tin đăng nhập đã được gửi qua email: {request.Email}";

                return Ok(APIResponse<string>.Builder()
                    .WithResult(responseMessage)
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

        /// <summary>
        /// Validate avatar file type and size
        /// </summary>
        /// <param name="file">File to validate</param>
        /// <returns>Error message if invalid, null if valid</returns>
        private static string? ValidateAvatarFile(IFormFile file)
        {
            if (file.Length == 0)
                return "Avatar file cannot be empty";

            // Check file size (5MB limit)
            const long maxSize = 5 * 1024 * 1024; // 5MB
            if (file.Length > maxSize)
                return "File size must be less than 5MB";

            // Check file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var fileExtension = Path.GetExtension(file.FileName)?.ToLower();
            
            if (string.IsNullOrEmpty(fileExtension) || !allowedExtensions.Contains(fileExtension))
                return $"Invalid file type. Allowed types: {string.Join(", ", allowedExtensions)}";

            return null; // Valid file
        }
    }
}
