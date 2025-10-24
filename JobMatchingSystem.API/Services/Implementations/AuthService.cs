using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly IAuthRepository _authRepository;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public AuthService(IAuthRepository authRepository,
                       SignInManager<ApplicationUser> signInManager,
                       IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _authRepository = authRepository;
            _signInManager = signInManager;
            _configuration = configuration;
            _httpContextAccessor = httpContextAccessor;
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
    }
}
