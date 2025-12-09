using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
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
            
            // Check if email is confirmed
            var isEmailConfirmed = await _userManager.IsEmailConfirmedAsync(user);
            if (!isEmailConfirmed)
                throw new AppException(new Error("Email chưa được xác nhận. Vui lòng xác nhận email trước khi reset password.", System.Net.HttpStatusCode.BadRequest));
            
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = HttpUtility.UrlEncode(token);
            
            // Save token tracking info
            user.PasswordResetToken = token;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1); // Token valid for 1 hour
            user.PasswordResetTokenUsed = false;
            await _userManager.UpdateAsync(user);
            
            await _emailService.SendResetPasswordEmailAsync(user.Email, encodedToken);
        }
        public async Task ResetPasswordAsync(ResetPasswordRequest request)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                throw new AppException(ErrorCode.InvalidCredentials());

            // Check if token has been used
            if (user.PasswordResetTokenUsed == true)
                throw new AppException(new Error("Token đã được sử dụng. Vui lòng yêu cầu reset password mới.", System.Net.HttpStatusCode.BadRequest));

            // Check if token has expired
            if (user.PasswordResetTokenExpiry == null || user.PasswordResetTokenExpiry < DateTime.UtcNow)
                throw new AppException(new Error("Token đã hết hạn. Vui lòng yêu cầu reset password mới.", System.Net.HttpStatusCode.BadRequest));

            // Check if token matches
            if (user.PasswordResetToken != request.Token)
                throw new AppException(new Error("Token không hợp lệ.", System.Net.HttpStatusCode.BadRequest));

            var result = await _userManager.ResetPasswordAsync(user, request.Token, request.NewPassword);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                throw new Exception($"Không thể đặt lại mật khẩu: {errors}");
            }

            // Mark token as used
            user.PasswordResetTokenUsed = true;
            user.PasswordResetToken = null; // Clear token for security
            await _userManager.UpdateAsync(user);
        }

        public async Task<LoginDTO> LoginAsync(LoginRequest request)
        {
            var user = await _authRepository.GetUserByEmailAsync(request.Email);
            if (user == null)
                throw new AppException(ErrorCode.InvalidCredentials());
            var result = await _signInManager.CheckPasswordSignInAsync(user, request.PassWord, false);
            if (result.IsNotAllowed)
            {
                throw new AppException(ErrorCode.NotConfirmEmail());
            }
            if (!result.Succeeded)
            {
                throw new AppException(ErrorCode.InvalidCredentials());
            }
            if (!user.IsActive)
            {
                throw new AppException(ErrorCode.AccountIsBand());
            }
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
            LoginDTO loginDTO = new LoginDTO();
            loginDTO.token = accessToken;
            return loginDTO;
        }

        public async Task Logout(int userId)
        {
            var user = await _authRepository.GetUserById(userId);
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _authRepository.UpdateUserAsync(user);

        }

        public async Task<LoginDTO> RefreshTokenAsync()
        {
            var refreshToken = _httpContextAccessor.HttpContext?.Request.Cookies["refreshToken"];

            if (string.IsNullOrEmpty(refreshToken))
                throw new AppException(ErrorCode.InValidToken());
            var user = await _authRepository.GetUserByRefreshToken(refreshToken);
            if (user == null || user.RefreshTokenExpiryTime < DateTime.UtcNow)
            {
                throw new AppException(ErrorCode.InValidToken());
            }
            var roles = await _authRepository.GetRolesAsync(user);

            var newAccessToken = Untity.GenerateAccessToken(user, roles, _configuration);
            return new LoginDTO
            {
                token = newAccessToken
            };

        }

        public async Task<string> RegisterAsync(RegisterRequest request)
        {

            if (await _authRepository.ExistsAsync(request.Email))
            {
                throw new AppException(ErrorCode.EmailExist());
            }
            var user = new ApplicationUser
            {
                FullName = request.FullName,
                Email = request.Email,
                UserName = request.Email,
                EmailConfirmed = false
            };
            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                throw new AppException(ErrorCode.InvalidCreate());
            }
            await _userManager.AddToRoleAsync(user, Contraints.RoleCandidate);
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = HttpUtility.UrlEncode(token);
            await _emailService.SendEmailConfirmationAsync(user.Email, user.FullName, $"{user.Id}:{encodedToken}");
            return "Please Check Email to Active Account";

        }
        public async Task<bool> VerifyEmailAsync(string tokenLink)
        {
            try
            {
                var parts = tokenLink.Split(new[] { ':' }, 2);
                if (parts.Length != 2)
                    return false;

                var userId = parts[0];
                var encodedToken = parts[1];

                var decodedToken = HttpUtility.UrlDecode(encodedToken);

                var user = await _userManager.FindByIdAsync(userId);
                if (user == null)
                    return false;

                var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

                if (result.Succeeded)
                {
                    await _emailService.SendWelcomeEmailAsync(user.Email!, user.FullName!);
                }

                return result.Succeeded;
            }
            catch
            {
                return false;
            }
        }

    }
}
