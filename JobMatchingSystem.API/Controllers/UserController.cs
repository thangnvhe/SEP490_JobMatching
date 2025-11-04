using Azure.Core;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Implementations;
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
        private readonly IWebHostEnvironment _env;

        public UserController(IUserService userService, IWebHostEnvironment env)
        {
            _userService = userService;
            _env = env;
        }
        [HttpGet]
        public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int size = 5, [FromQuery] string search = "",
        [FromQuery] int role = 0)
        {
            var result = await _userService.GetAllUser(page, size,search,role);

            return Ok(APIResponse<PagedResult<UserResponseDTO>>.Builder()
                .WithResult(result)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            
                var user = await _userService.GetUserById(id);
                return Ok(APIResponse<UserResponseDTO>.Builder()
                    .WithResult(user)
                    .WithSuccess(true)
                    .WithStatusCode(HttpStatusCode.OK)
                    .Build()); 
            
            
        }
        [HttpPost()]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserByAdminRequest request)
        {
            await _userService.CreateUserByAdminAsync(request);
            return Ok(APIResponse<string>.Builder()
                    .WithResult("Create Success")
                    .WithSuccess(true)
                    .WithStatusCode(HttpStatusCode.OK)
                    .Build());
        }
        [HttpPut("{userId}/change-status")]
        public async Task<IActionResult> ChangeStatus(int userId)
        {
            await _userService.ChangeStatus(userId);
            return Ok(APIResponse<string>.Builder()
                    .WithResult("Change Status Success")
                    .WithSuccess(true)
                    .WithStatusCode(HttpStatusCode.OK)
                    .Build());
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            var user = await _userService.GetUserByIdAsync(userId);

            if (user == null)
            {
                return NotFound(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .WithSuccess(false)
                    .WithMessage("User không tồn tại.")
                    .Build());
            }

            return Ok(APIResponse<UserResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(user)
                .Build());
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            await _userService.ChangePasswordAsync(userId, request);

            return Ok(APIResponse<string>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult("Đổi mật khẩu thành công.")
                .Build());
        }

        [HttpPut("update-me")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateUserProfileRequest request)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "0");

            var updatedUser = await _userService.UpdateUserProfileAsync(userId, request, _env);

            return Ok(APIResponse<UserResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(updatedUser)
                .Build());
        }
    }
}
