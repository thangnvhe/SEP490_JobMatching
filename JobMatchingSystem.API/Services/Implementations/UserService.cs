using AutoMapper;
﻿using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Repositories.Implementations;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher<ApplicationUser> _passwordHasher;

        protected readonly IAuthRepository _authRepository;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;
        public UserService(IAuthRepository authRepository, IMapper mapper, UserManager<ApplicationUser> userManager, IEmailService emailService, IUserRepository userRepository, IPasswordHasher<ApplicationUser> passwordHasher)
        {
            _authRepository = authRepository;
            _mapper = mapper;
            _userManager = userManager;
            _emailService = emailService;
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<List<UserResponseDTO>> GetAllUser()
        {
            var listUser = await _authRepository.GetAllAsync();
            if (listUser == null || !listUser.Any())
                return new List<UserResponseDTO>();
            var listUserDTO = _mapper.Map<List<UserResponseDTO>>(listUser);
            for (int i = 0; i < listUser.Count; i++)
            {
                var roles = await _userManager.GetRolesAsync(listUser[i]);
                listUserDTO[i].Role = roles.FirstOrDefault() ?? "NoRole";
            }
            return listUserDTO;
        }

        public async Task<UserResponseDTO> GetUserById(int userId)
        {
            var user = await _authRepository.GetUserById(userId);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }
            var userDTO = _mapper.Map<UserResponseDTO>(user);
            var roles = await _userManager.GetRolesAsync(user);
            userDTO.Role = roles.FirstOrDefault() ?? "NoRole";
            return userDTO;
        }
        public async Task CreateUserByAdminAsync(CreateUserByAdminRequest request)
        {

            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                throw new AppException(ErrorCode.EmailExist());


            var password = "Aa@" + Guid.NewGuid().ToString("N").Substring(0, 6);



            var user = new ApplicationUser
            {
                FullName = request.FullName,
                Email = request.Email,
                UserName = request.Email,
                PhoneNumber = request.PhoneNumber,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                throw new AppException(ErrorCode.InvalidCreate());
            await _userManager.AddToRoleAsync(user, request.Role);


            var body = $@"
                <h3>Xin chào {request.FullName},</h3>
                <p>Tài khoản của bạn đã được tạo thành công.</p>
                <p><b>Email đăng nhập:</b> {request.Email}</p>
                <p><b>Mật khẩu tạm thời:</b> {password}</p>
                <p>Vui lòng đăng nhập và đổi mật khẩu sớm nhất có thể.</p>
            ";
            await _emailService.SendEmailAsync(request.Email, "Tài khoản mới của bạn", body);
        }

        public async Task ChangeStatus(int userId)
        {
            var user = await _authRepository.GetUserById(userId);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }
            await _authRepository.ChangeStatus(user);

        }

        public async Task<UserResponse?> GetUserByIdAsync(int id)
        {
            var user = await _userRepository.GetByIdAsync(id);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            return new UserResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Gender = user.Gender,
                Birthday = user.Birthday,
                Score = user.Score,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumber = user.PhoneNumber
            };
        }

        public async Task ChangePasswordAsync(int userId, ChangePasswordRequest request)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var verify = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
            if (verify == PasswordVerificationResult.Failed)
                throw new AppException(ErrorCode.PassErr());

            user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
            await _userRepository.UpdateAsync(user);
        }

        public async Task<UserResponse?> UpdateUserProfileAsync(int userId, UpdateUserProfileRequest request, IWebHostEnvironment env)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            // Cập nhật thông tin cơ bản
            user.FullName = request.FullName ?? user.FullName;
            user.Gender = request.Gender ?? user.Gender;
            user.Birthday = request.Birthday ?? user.Birthday;
            user.PhoneNumber = request.PhoneNumber ?? user.PhoneNumber;
            user.UpdatedAt = DateTime.Now;

            // Xử lý avatar
            if (request.Avatar != null && request.Avatar.Length > 0)
            {
                var folderPath = Path.Combine(env.WebRootPath, "images", "Avatar");
                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                // Xóa avatar cũ nếu tồn tại
                if (!string.IsNullOrEmpty(user.AvatarUrl))
                {
                    var oldFilePath = Path.Combine(env.WebRootPath, user.AvatarUrl.TrimStart('/'));
                    if (File.Exists(oldFilePath))
                    {
                        File.Delete(oldFilePath);
                    }
                }

                // Lưu avatar mới
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(request.Avatar.FileName)}";
                var filePath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.Avatar.CopyToAsync(stream);
                }

                user.AvatarUrl = $"/images/Avatar/{fileName}";
            }

            await _userRepository.UpdateAsync(user);

            return new UserResponse
            {
                Id = user.Id,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                Gender = user.Gender,
                Birthday = user.Birthday,
                Score = user.Score,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt,
                UpdatedAt = user.UpdatedAt,
                UserName = user.UserName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                EmailConfirmed = user.EmailConfirmed,
                PhoneNumber = user.PhoneNumber
            };
        }
    }
}
