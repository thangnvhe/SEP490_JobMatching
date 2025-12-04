using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Extensions;
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
        protected readonly IBlobStorageService _blobStorageService;

        public UserService(IUnitOfWork unitOfWork, IMapper mapper, IWebHostEnvironment webHostEnvironment, UserManager<ApplicationUser> userManager, RoleManager<IdentityRole<int>> roleManager, IEmailService emailService, IBlobStorageService blobStorageService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
            _userManager = userManager;
            _roleManager = roleManager;
            _emailService = emailService;
            _blobStorageService = blobStorageService;
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
                
                // Generate secure URL with SAS token for avatar access
                var secureAvatarUrl = await _blobStorageService.GetSecureFileUrlAsync(user.AvatarUrl);
                
                var userDetailDto = new UserDetailResponseDTO
                {
                    Id = user.Id,
                    FullName = user.FullName ?? string.Empty,
                    Email = user.Email ?? string.Empty,
                    UserName = user.UserName ?? string.Empty,
                    PhoneNumber = user.PhoneNumber ?? string.Empty,
                    Address = user.Address ?? string.Empty,
                    AvatarUrl = secureAvatarUrl,
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
            
            // Generate secure URL with SAS token for avatar access
            var secureAvatarUrl = await _blobStorageService.GetSecureFileUrlAsync(user.AvatarUrl);

            var userDetailDto = new UserDetailResponseDTO
            {
                Id = user.Id,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Address = user.Address ?? string.Empty,
                AvatarUrl = secureAvatarUrl,
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
            
            // Generate secure URL with SAS token for avatar access
            var secureAvatarUrl = await _blobStorageService.GetSecureFileUrlAsync(user.AvatarUrl);

            var userDetailDto = new UserDetailResponseDTO
            {
                Id = user.Id,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Address = user.Address ?? string.Empty,
                AvatarUrl = secureAvatarUrl,
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

                // Delete old avatar from Azure Blob Storage if exists
                if (!string.IsNullOrEmpty(user.AvatarUrl))
                {
                    await _blobStorageService.DeleteFileAsync(user.AvatarUrl);
                }

                // Generate unique filename for avatar
                var fileName = $"avatar_{user.Id}_{DateTime.Now:yyyyMMddHHmmss}{fileExtension}";
                
                // Upload new avatar to Azure Blob Storage
                var avatarFileUrl = await _blobStorageService.UploadFileAsync(request.AvatarFile, "avartars", fileName);
                
                // Update avatar URL
                user.AvatarUrl = avatarFileUrl;
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

            // Generate secure URL with SAS token for avatar access
            var secureAvatarUrl = await _blobStorageService.GetSecureFileUrlAsync(updatedUser.AvatarUrl);

            var updatedUserDTO = new UserDetailResponseDTO
            {
                Id = updatedUser.Id,
                FullName = updatedUser.FullName ?? string.Empty,
                Email = updatedUser.Email ?? string.Empty,
                UserName = updatedUser.UserName ?? string.Empty,
                PhoneNumber = updatedUser.PhoneNumber ?? string.Empty,
                Address = updatedUser.Address ?? string.Empty,
                AvatarUrl = secureAvatarUrl,
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

        public async Task<UserDetailResponseDTO> UpdateUserByAdmin(int userId, UpdateUserByAdminRequest request)
        {
            var user = await _unitOfWork.AuthRepository.GetUserById(userId);
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

                // Delete old avatar from Azure Blob Storage if exists
                if (!string.IsNullOrEmpty(user.AvatarUrl))
                {
                    await _blobStorageService.DeleteFileAsync(user.AvatarUrl);
                }

                // Generate unique filename for avatar
                var fileName = $"avatar_{user.Id}_{DateTime.Now:yyyyMMddHHmmss}{fileExtension}";
                
                // Upload new avatar to Azure Blob Storage
                var avatarFileUrl = await _blobStorageService.UploadFileAsync(request.AvatarFile, "avartars", fileName);
                
                // Update avatar URL
                user.AvatarUrl = avatarFileUrl;
            }

            // Update user properties only if they are provided (partial update)
            if (!string.IsNullOrWhiteSpace(request.FullName))
            {
                user.FullName = request.FullName;
            }

            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                // Check if email already exists (exclude current user)
                var existingUser = await _userManager.FindByEmailAsync(request.Email);
                if (existingUser != null && existingUser.Id != user.Id)
                {
                    throw new AppException(ErrorCode.EmailAlreadyExists());
                }
                user.Email = request.Email;
                user.UserName = request.Email; // Username is usually email
                user.NormalizedEmail = request.Email.ToUpper();
                user.NormalizedUserName = request.Email.ToUpper();
            }

            if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            {
                user.PhoneNumber = request.PhoneNumber;
            }

            if (request.Address != null)
            {
                user.Address = request.Address;
            }

            if (!string.IsNullOrWhiteSpace(request.Gender))
            {
                if (bool.TryParse(request.Gender, out var gender))
                {
                    user.Gender = gender;
                }
                else if (request.Gender.Equals("Male", StringComparison.OrdinalIgnoreCase))
                {
                    user.Gender = true; // true = Male
                }
                else if (request.Gender.Equals("Female", StringComparison.OrdinalIgnoreCase))
                {
                    user.Gender = false; // false = Female
                }
            }

            if (request.Birthday.HasValue)
            {
                user.Birthday = request.Birthday.Value;
            }

            if (request.IsActive.HasValue)
            {
                user.IsActive = request.IsActive.Value;
            }

            if (request.CompanyId.HasValue)
            {
                user.CompanyId = request.CompanyId.Value;
            }

            // Handle role update if provided
            if (!string.IsNullOrWhiteSpace(request.Role))
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                if (currentRoles.Any())
                {
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);
                }

                // Check if role exists
                var roleExists = await _roleManager.RoleExistsAsync(request.Role);
                if (!roleExists)
                {
                    throw new AppException(ErrorCode.RoleNotFound());
                }

                await _userManager.AddToRoleAsync(user, request.Role);
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

            // Generate secure URL with SAS token for avatar access
            var secureAvatarUrl = await _blobStorageService.GetSecureFileUrlAsync(updatedUser.AvatarUrl);

            var updatedUserDTO = new UserDetailResponseDTO
            {
                Id = updatedUser.Id,
                FullName = updatedUser.FullName ?? string.Empty,
                Email = updatedUser.Email ?? string.Empty,
                UserName = updatedUser.UserName ?? string.Empty,
                PhoneNumber = updatedUser.PhoneNumber ?? string.Empty,
                Address = updatedUser.Address ?? string.Empty,
                AvatarUrl = secureAvatarUrl,
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

        /// <summary>
        /// Clean up user avatar when deleting user account
        /// </summary>
        /// <param name="userId">User ID to clean up avatar for</param>
        /// <returns></returns>
        public async Task CleanupUserAvatarAsync(int userId)
        {
            try
            {
                var user = await _unitOfWork.AuthRepository.GetUserById(userId);
                if (user != null && !string.IsNullOrEmpty(user.AvatarUrl))
                {
                    await _blobStorageService.DeleteFileAsync(user.AvatarUrl);
                }
            }
            catch (Exception)
            {
                // Log error but don't throw - file cleanup shouldn't break the main flow
                // You might want to add proper logging here
            }
        }
    }
}
