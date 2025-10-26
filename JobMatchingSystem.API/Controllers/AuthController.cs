using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest model)
        {
            var response = await _authService.LoginAsync(model);
            return Ok(APIResponse<LoginDTO>.Builder()
                .WithResult(response)
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .Build());     
        }
        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken()
        {
            var result = await _authService.RefreshTokenAsync();
            return Ok(APIResponse<LoginDTO>.Builder()
                .WithResult(result)
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .Build());
        }
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            int userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? "0");
            await _authService.Logout(userId);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Logout Success")
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .Build());
        }
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            var result = await _authService.RegisterAsync(request);
            return Ok(APIResponse<string>.Builder()
                .WithResult(result)
                .WithStatusCode(HttpStatusCode.Created)
                .WithSuccess(true)
                .Build());
        }
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            await _authService.ForgotPasswordAsync(request);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Please check your Email")
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .Build());
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
        {
            await _authService.ResetPasswordAsync(request);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Change Password Success")
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .Build());
        }

    }
}
