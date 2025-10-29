﻿using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Web;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;
        public AuthService(IAuthRepository authRepository,
                       SignInManager<ApplicationUser> signInManager,
                       IConfiguration configuration,
                       IHttpContextAccessor httpContextAccessor,
                       UserManager<ApplicationUser> userManager,
                       IEmailService emailService)
        {
            _authRepository = authRepository;
            _signInManager = signInManager;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
            _userManager = userManager;
            _emailService = emailService;
        }

        public async Task ForgotPasswordAsync(ForgotPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                throw new AppException(ErrorCode.EmailNotExist());
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = HttpUtility.UrlEncode(token);
            var frontendUrl = _configuration["Frontend:ResetPasswordUrl"];
            var resetLink = $"{frontendUrl}/{encodedToken}?email={user.Email}";
            await _emailService.SendResetPasswordEmailAsync(user.Email, resetLink);
        }
        public async Task ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                throw new AppException(ErrorCode.InvalidCredentials());

            var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Không thể đặt lại mật khẩu: {errors}");
            }
        }

        public async Task<LoginDTO> LoginAsync(LoginRequest request)
        {
            var user = await _authRepository.GetUserByEmailAsync(request.Email);
            if (user == null)
                throw new AppException(ErrorCode.InvalidCredentials());
            var result = await _signInManager.CheckPasswordSignInAsync(user, request.PassWord, false);
            if (!result.Succeeded)
                throw new AppException(ErrorCode.InvalidCredentials());
            var roles = await _authRepository.GetRolesAsync(user);
            var accessToken = Untity.GenerateAccessToken(user, roles, _configuration);
            var refreshToken = Untity.GenerateRefreshToken();
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _authRepository.UpdateUserAsync(user);
            _httpContextAccessor.HttpContext!.Response.Cookies.Append("refreshToken", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = user.RefreshTokenExpiryTime
            });
            LoginDTO loginDTO=new LoginDTO();
            loginDTO.token = accessToken; 
            return loginDTO ;
        }

        public async Task Logout(int userId)
        {
            var user= await _authRepository.GetUserById(userId);
            user.RefreshToken=null;
            user.RefreshTokenExpiryTime = null;
            await _authRepository.UpdateUserAsync(user);           
        }

        public async Task<LoginDTO> RefreshTokenAsync()
        {
            var refreshToken = _httpContextAccessor.HttpContext?.Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
                throw new AppException(ErrorCode.InValidToken());
            var user = await _authRepository.GetUserByRefreshToken(refreshToken);
            if(user == null || user.RefreshTokenExpiryTime < DateTime.UtcNow)
            {
                throw new AppException(ErrorCode.InValidToken());
            }
            var roles = await _authRepository.GetRolesAsync(user);

            var newAccessToken = Untity.GenerateAccessToken (user, roles,_configuration);
            return new LoginDTO
            {
                token = newAccessToken
            };

        }

        public async Task<string> RegisterAsync(RegisterRequest request)
        {
            
            if (await _authRepository.ExistsAsync(request.Email)) {
            throw new AppException(ErrorCode.EmailExist());
            }
            var user = new ApplicationUser
            {
                FullName = request.FullName,
                Email = request.Email,
                UserName = request.Email,
                EmailConfirmed = true
            };
            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                throw new AppException(ErrorCode.InvalidCreate());             
            }
            await _userManager.AddToRoleAsync(user, Contraints.RoleCandidate);
            return "Create Candidate Success";

        }
    }
}
