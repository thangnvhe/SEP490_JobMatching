using Azure.Core;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Implementations;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

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
    }
}
