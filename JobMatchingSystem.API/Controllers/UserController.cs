using Azure.Core;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
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
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUser();
            return Ok(APIResponse<List<UserResponseDTO>>.Builder()
                    .WithResult(users)
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
