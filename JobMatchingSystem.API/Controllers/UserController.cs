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

        public UserController(IUserService userService)
        {
            _userService = userService;
        }
        [HttpGet]
        public async Task<ActionResult<PagedResult<UserResponseDTO>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int size = 5,
        [FromQuery] string search = "",
        [FromQuery] string sortBy = "",
        [FromQuery] bool isDecending = false)
        {
            var result = await _userService.GetAllUser(page, size, search, sortBy, isDecending);
         return Ok(APIResponse<PagedResult<UserResponseDTO>>.Builder()
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

            return Ok(APIResponse<CurrentUserResponseDTO>.Builder()
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

            return Ok(APIResponse<CurrentUserResponseDTO>.Builder()
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

            return Ok(APIResponse<UserResponseDTO>.Builder()
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

    }
}
