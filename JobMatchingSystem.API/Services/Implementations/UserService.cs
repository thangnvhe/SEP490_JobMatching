using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
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
        protected readonly UserManager<ApplicationUser> _userManager;
        protected readonly RoleManager<IdentityRole<int>> _roleManager;
        protected readonly IEmailService _emailService;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper, IWebHostEnvironment webHostEnvironment, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<int>> roleManager, IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
            _userManager = userManager;
            _roleManager = roleManager;
            _emailService = emailService;
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

        public async Task<PagedResult<UserDetailResponseDTO>> GetAllUser(int page = 1, int size = 5, string search = "", string sortBy = "", bool isDecending = false, int? companyId = null, string? role = null)
        {
            var listUser = await _unitOfWork.AuthRepository.GetAllAsync(search, sortBy, isDecending);
            if (listUser == null || !listUser.Any())
            {
                return new PagedResult<UserDetailResponseDTO>
                {
                    Items = new List<UserDetailResponseDTO>(),
                    pageInfo = new PageInfo(0, page, size, sortBy, isDecending)
                };
            }

            var userDetailDtos = new List<UserDetailResponseDTO>();
            
            foreach (var user in listUser)
            {
                // Get user roles
                var roles = await _unitOfWork.AuthRepository.GetRolesAsync(user);
                var userRole = roles.FirstOrDefault();

                // Apply filters
                if (companyId.HasValue && user.CompanyId != companyId.Value)
                    continue;

                if (!string.IsNullOrEmpty(role) && (userRole == null || !userRole.Equals(role, StringComparison.OrdinalIgnoreCase)))
                    continue;
                
                var userDetailDto = new UserDetailResponseDTO
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
                    CreatedAt = user.CreatedAt,
                    Role = userRole
                };
                
                userDetailDtos.Add(userDetailDto);
            }

            // Apply custom sorting for CreatedAt
            if (!string.IsNullOrEmpty(sortBy) && sortBy.Equals("CreatedAt", StringComparison.OrdinalIgnoreCase))
            {
                userDetailDtos = isDecending 
                    ? userDetailDtos.OrderByDescending(u => u.CreatedAt).ToList()
                    : userDetailDtos.OrderBy(u => u.CreatedAt).ToList();
            }

            // Apply pagination after filtering
            var pagedUsers = userDetailDtos
                .Skip((page - 1) * size)
                .Take(size)
                .ToList();

            return new PagedResult<UserDetailResponseDTO>
            {
                Items = pagedUsers,
                pageInfo = new PageInfo(userDetailDtos.Count, page, size, sortBy, isDecending)
            };
        }

        public async Task<UserDetailResponseDTO> GetUserById(int userId)
        {
            var user = await _unitOfWork.AuthRepository.GetUserById(userId);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            // Get user roles
            var roles = await _unitOfWork.AuthRepository.GetRolesAsync(user);

            var userDetailDto = new UserDetailResponseDTO
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
                CreatedAt = user.CreatedAt,
                Role = roles.FirstOrDefault()
            };

            return userDetailDto;
        }

        public async Task<UserDetailResponseDTO> GetCurrentUser(string userId)
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

            var userDetailDto = new UserDetailResponseDTO
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
                CreatedAt = user.CreatedAt,
                Role = roles.FirstOrDefault()
            };

            return userDetailDto;
        }

        public async Task<UserDetailResponseDTO> UpdateCurrentUser(string userId, UpdateCurrentUserRequest request)
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

            // Get updated user with company information
            var updatedUser = await _unitOfWork.AuthRepository.GetUserById(user.Id);
            if (updatedUser == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            var updatedUserDTO = new UserDetailResponseDTO
            {
                Id = updatedUser.Id,
                FullName = updatedUser.FullName ?? string.Empty,
                Email = updatedUser.Email ?? string.Empty,
                UserName = updatedUser.UserName ?? string.Empty,
                PhoneNumber = updatedUser.PhoneNumber ?? string.Empty,
                Address = updatedUser.Address ?? string.Empty,
                AvatarUrl = updatedUser.AvatarUrl,
                Gender = updatedUser.Gender,
                Birthday = updatedUser.Birthday,
                IsActive = updatedUser.IsActive,
                Score = updatedUser.Score,
                CompanyId = updatedUser.CompanyId,
                Role = roles.FirstOrDefault(),
                CreatedAt = updatedUser.CreatedAt
            };

            return updatedUserDTO;
        }

        public async Task<UserDetailResponseDTO> CreateHiringManager(CreateHiringManagerRequest request)
        {
            try
            {
                // Check if email already exists
                var existingUser = await _userManager.FindByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    throw new AppException(ErrorCode.EmailAlreadyExists());
                }

                // Check if company exists
                var company = await _unitOfWork.CompanyRepository.GetByIdAsync(request.CompanyId);
                if (company == null)
                {
                    throw new AppException(ErrorCode.NotFoundCompany());
                }

                // Ensure Hiring Manager role exists
                if (!await _roleManager.RoleExistsAsync(Contraints.RoleHiringManager))
                {
                    var roleCreateResult = await _roleManager.CreateAsync(new IdentityRole<int>(Contraints.RoleHiringManager));
                    if (!roleCreateResult.Succeeded)
                    {
                        var roleErrors = string.Join(", ", roleCreateResult.Errors.Select(e => e.Description));
                        throw new AppException(ErrorCode.CreateUserFailed($"Failed to create role: {roleErrors}"));
                    }
                }

                // Generate temporary password using utility
                var temporaryPassword = Untity.Generate(12); // Generate 12-character secure password

                // Create new user
                var newUser = new ApplicationUser
                {
                    FullName = request.FullName,
                    Email = request.Email,
                    UserName = request.Email, // Use email as username
                    PhoneNumber = request.Phone,
                    CompanyId = request.CompanyId,
                    IsActive = true,
                    Score = 100,
                    EmailConfirmed = true, // Auto confirm for hiring managers
                    CreatedAt = DateTime.UtcNow
                };

                // Create user with temporary password
                var result = await _userManager.CreateAsync(newUser, temporaryPassword);
                if (!result.Succeeded)
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new AppException(ErrorCode.CreateUserFailed(errors));
                }

                // Assign Hiring Manager role
                var roleResult = await _userManager.AddToRoleAsync(newUser, Contraints.RoleHiringManager);
                if (!roleResult.Succeeded)
                {
                    // Delete user if role assignment failed
                    await _userManager.DeleteAsync(newUser);
                    var roleErrors = string.Join(", ", roleResult.Errors.Select(e => e.Description));
                    throw new AppException(ErrorCode.AssignRoleFailed());
                }

                // Send email with temporary password
                try
                {
                    await _emailService.SendHmPasswordEmailAsync(newUser.Email, newUser.FullName, temporaryPassword);
                }
                catch (Exception emailEx)
                {
                    // Log email error but don't fail the entire operation
                    // User is already created, just email failed
                    // TODO: Add proper logging here
                    Console.WriteLine($"Failed to send email to {newUser.Email}: {emailEx.Message}");
                }

                // Get user roles for response
                var roles = await _userManager.GetRolesAsync(newUser);

                // Return user detail
                var userDetailDto = new UserDetailResponseDTO
                {
                    Id = newUser.Id,
                    FullName = newUser.FullName ?? string.Empty,
                    Email = newUser.Email ?? string.Empty,
                    UserName = newUser.UserName ?? string.Empty,
                    PhoneNumber = newUser.PhoneNumber ?? string.Empty,
                    Address = newUser.Address ?? string.Empty,
                    AvatarUrl = newUser.AvatarUrl,
                    Gender = newUser.Gender,
                    Birthday = newUser.Birthday,
                    IsActive = newUser.IsActive,
                    Score = newUser.Score,
                    CompanyId = newUser.CompanyId,
                    CreatedAt = newUser.CreatedAt,
                    Role = roles.FirstOrDefault()
                };

                return userDetailDto;
            }
            catch (AppException)
            {
                throw; // Re-throw AppException as-is
            }
            catch (Exception ex)
            {
                throw new AppException(ErrorCode.CreateUserFailed($"Unexpected error: {ex.Message}"));
            }
        }

    }
}
