using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Repositories.Implementations;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Data;
using System.Security.Claims;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class UserService : IUserService
    {
        protected readonly IUnitOfWork _unitOfWork;
        protected readonly IMapper _mapper;
        protected readonly IWebHostEnvironment _webHostEnvironment;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper, IWebHostEnvironment webHostEnvironment)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
        }
        public async Task ChangeStatus(int userId)
        {
            var user = await _unitOfWork.AuthRepository.GetUserById(userId);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }
            await _unitOfWork.AuthRepository.ChangeStatus(user);
            await _unitOfWork.SaveAsync();
        }

        public async Task<PagedResult<UserResponseDTO>> GetAllUser(int page = 1, int size = 5, string search = "", string sortBy = "", bool isDecending = false)
        {
            var listUser = await _unitOfWork.AuthRepository.GetAllAsync( search,sortBy, isDecending);
            if (listUser == null || !listUser.Any())
            {
                return new PagedResult<UserResponseDTO>
                {
                    Items = new List<UserResponseDTO>(),
                    pageInfo = new PageInfo(0, page, size, sortBy, isDecending)
                };
            }
            var users =  listUser
           .Skip((page - 1) * size)
           .Take(size)
           .ToList();
            var userDtos=_mapper.Map<List<UserResponseDTO>>(users);
            return new PagedResult<UserResponseDTO>
            {
                Items = userDtos,
                pageInfo = new PageInfo(listUser.Count, page, size, sortBy, isDecending)
            };
        }

        public async Task<UserResponseDTO> GetUserById(int userId)
        {
            var user = await _unitOfWork.AuthRepository.GetUserById(userId);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }
            var userDTO = _mapper.Map<UserResponseDTO>(user);
            return userDTO;
        }

        public async Task<CurrentUserResponseDTO> GetCurrentUser(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            // Convert string userId to int since the repository expects int
            if (!int.TryParse(userId, out int userIdInt))
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            var user = await _unitOfWork.AuthRepository.GetUserById(userIdInt);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            // Get user roles
            var roles = await _unitOfWork.AuthRepository.GetRolesAsync(user);

            var currentUserDTO = new CurrentUserResponseDTO
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Address = user.Address,
                AvatarUrl = user.AvatarUrl,
                Gender = user.Gender,
                Birthday = user.Birthday,
                IsActive = user.IsActive,
                Score = user.Score,
                CompanyId = user.CompanyId,
                Role = roles.FirstOrDefault() // Lấy role đầu tiên vì mỗi user chỉ có 1 role
            };

            return currentUserDTO;
        }

        public async Task<CurrentUserResponseDTO> UpdateCurrentUser(string userId, UpdateCurrentUserRequest request)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            // Convert string userId to int since the repository expects int
            if (!int.TryParse(userId, out int userIdInt))
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            var user = await _unitOfWork.AuthRepository.GetUserById(userIdInt);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            // Handle avatar file upload if provided
            if (request.AvatarFile != null && request.AvatarFile.Length > 0)
            {
                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(request.AvatarFile.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    throw new AppException(ErrorCode.InvalidFileType());
                }

                // Validate file size (max 5MB)
                if (request.AvatarFile.Length > 5 * 1024 * 1024)
                {
                    throw new AppException(ErrorCode.FileSizeExceeded());
                }

                // Create upload directory if it doesn't exist
                var uploadsDir = Path.Combine(_webHostEnvironment.WebRootPath, "uploads", "avatars");
                if (!Directory.Exists(uploadsDir))
                {
                    Directory.CreateDirectory(uploadsDir);
                }

                // Generate unique filename
                var fileName = $"{user.Id}_{DateTime.Now:yyyyMMddHHmmss}{fileExtension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                // Delete old avatar file if exists
                if (!string.IsNullOrEmpty(user.AvatarUrl))
                {
                    var oldFileName = Path.GetFileName(user.AvatarUrl);
                    var oldFilePath = Path.Combine(uploadsDir, oldFileName);
                    if (File.Exists(oldFilePath))
                    {
                        File.Delete(oldFilePath);
                    }
                }

                // Save new avatar file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await request.AvatarFile.CopyToAsync(stream);
                }

                // Update avatar URL - system generated path
                user.AvatarUrl = $"/uploads/avatars/{fileName}";
            }

            // Update user properties only if they are provided (partial update)
            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                user.FullName = request.FullName;
            }

            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                user.PhoneNumber = request.PhoneNumber;
            }

            if (request.Address != null)
            {
                user.Address = request.Address;
            }

            if (request.Gender.HasValue)
            {
                user.Gender = request.Gender.Value;
            }

            if (request.Birthday.HasValue)
            {
                user.Birthday = request.Birthday.Value;
            }

            // Update user in database
            await _unitOfWork.AuthRepository.UpdateUserAsync(user);
            await _unitOfWork.SaveAsync();

            // Get user roles for the response
            var roles = await _unitOfWork.AuthRepository.GetRolesAsync(user);

            var updatedUserDTO = new CurrentUserResponseDTO
            {
                Id = user.Id,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Address = user.Address ?? string.Empty,
                AvatarUrl = user.AvatarUrl,
                Gender = user.Gender,
                Birthday = user.Birthday,
                IsActive = user.IsActive,
                Score = user.Score,
                CompanyId = user.CompanyId,
                Role = roles.FirstOrDefault()
            };

            return updatedUserDTO;
        }
    }
}
