using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;
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
        [HttpPost("hm")]
        public async Task<IActionResult> CreateHm([FromBody] CreateHmRequest request)
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _userService.CreateHm(request, userId);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Hiring Manager created successfully. Please check email for password.")
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .Build());
        }

        [HttpGet("hm/company")]
        public async Task<IActionResult> GetHmByCompanyId()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            var list = await _userService.GetListHmByCompanyId(userId);
            return Ok(APIResponse<List<UserResponseDTO>>.Builder()
                .WithResult(list)
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .Build());
        }

    }
}
