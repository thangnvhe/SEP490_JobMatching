using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Enums;
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

            // Check if user is being deactivated and is a recruiter
            var userRoles = await _unitOfWork.AuthRepository.GetRolesAsync(user);
            bool isRecruiter = userRoles.Contains("Recruiter");
            bool wasActive = user.IsActive;

            await _unitOfWork.AuthRepository.ChangeStatus(user);

            // If recruiter is being deactivated, handle their jobs and candidates
            if (isRecruiter && wasActive && !user.IsActive)
            {
                await HandleRecruiterDeactivationAsync(user.Id);
            }

            await _unitOfWork.SaveAsync();
        }

        public async Task<PagedResult<UserDetailResponseDTO>> GetAllUser(int page = 1, int size = 5, string search = "", string sortBy = "", bool isDecending = false, int? companyId = null, string? role = null, bool? status = null)
        {
            // Don't pass sortBy to repository if sorting by computed fields (handled in-memory later)
            var repositorySortBy = (sortBy.Equals("Role", StringComparison.OrdinalIgnoreCase) || 
                                    sortBy.Equals("Score", StringComparison.OrdinalIgnoreCase) ||
                                    sortBy.Equals("FullName", StringComparison.OrdinalIgnoreCase) ||
                                    sortBy.Equals("Email", StringComparison.OrdinalIgnoreCase))
                ? string.Empty 
                : sortBy;
            
            var listUser = await _unitOfWork.AuthRepository.GetAllAsync(search, repositorySortBy, isDecending, status);
            if (listUser == null || !listUser.Any())
            {
                return new PagedResult<UserDetailResponseDTO>
                {
                    Items = new List<UserDetailResponseDTO>(),
                    pageInfo = new PageInfo(0, page, size, sortBy, isDecending)
                };
            }

            // Apply companyId filter before batch loading
            if (companyId.HasValue)
            {
                listUser = listUser.Where(u => u.CompanyId == companyId.Value).ToList();
            }

            // Batch load all user roles in one query to avoid N+1
            var userIds = listUser.Select(u => u.Id).ToList();
            var userRolesDictionary = await _unitOfWork.AuthRepository.GetUserRolesDictionaryAsync(userIds);

            // Apply role filter after getting roles
            if (!string.IsNullOrEmpty(role))
            {
                listUser = listUser.Where(u => 
                    userRolesDictionary.ContainsKey(u.Id) && 
                    userRolesDictionary[u.Id].Equals(role, StringComparison.OrdinalIgnoreCase)
                ).ToList();
            }

            // Batch generate secure avatar URLs
            var avatarUrls = listUser.Select(u => u.AvatarUrl).Distinct().Where(url => !string.IsNullOrEmpty(url)).ToList();
            var secureUrlDictionary = new Dictionary<string, string>();
            foreach (var url in avatarUrls)
            {
                if (!string.IsNullOrEmpty(url))
                {
                    var secureUrl = await _blobStorageService.GetSecureFileUrlAsync(url);
                    if (!string.IsNullOrEmpty(secureUrl))
                    {
                        secureUrlDictionary[url] = secureUrl;
                    }
                }
            }

            var userDetailDtos = new List<UserDetailResponseDTO>();
            
            foreach (var user in listUser)
            {
                var userRole = userRolesDictionary.GetValueOrDefault(user.Id, string.Empty);
                var secureAvatarUrl = !string.IsNullOrEmpty(user.AvatarUrl) && secureUrlDictionary.ContainsKey(user.AvatarUrl)
                    ? secureUrlDictionary[user.AvatarUrl]
                    : string.Empty;
                
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

            // Apply custom sorting for CreatedAt, Role, Score, FullName, and Email
            if (!string.IsNullOrEmpty(sortBy))
            {
                if (sortBy.Equals("CreatedAt", StringComparison.OrdinalIgnoreCase))
                {
                    userDetailDtos = isDecending 
                        ? userDetailDtos.OrderByDescending(u => u.CreatedAt).ToList()
                        : userDetailDtos.OrderBy(u => u.CreatedAt).ToList();
                }
                else if (sortBy.Equals("Role", StringComparison.OrdinalIgnoreCase))
                {
                    userDetailDtos = isDecending 
                        ? userDetailDtos.OrderByDescending(u => u.Role).ToList()
                        : userDetailDtos.OrderBy(u => u.Role).ToList();
                }
                else if (sortBy.Equals("Score", StringComparison.OrdinalIgnoreCase))
                {
                    userDetailDtos = isDecending 
                        ? userDetailDtos.OrderByDescending(u => u.Score ?? 0).ToList()
                        : userDetailDtos.OrderBy(u => u.Score ?? 0).ToList();
                }
                else if (sortBy.Equals("FullName", StringComparison.OrdinalIgnoreCase))
                {
                    userDetailDtos = isDecending 
                        ? userDetailDtos.OrderByDescending(u => u.FullName).ToList()
                        : userDetailDtos.OrderBy(u => u.FullName).ToList();
                }
                else if (sortBy.Equals("Email", StringComparison.OrdinalIgnoreCase))
                {
                    userDetailDtos = isDecending 
                        ? userDetailDtos.OrderByDescending(u => u.Email).ToList()
                        : userDetailDtos.OrderBy(u => u.Email).ToList();
                }
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
            if (request.avatarFile != null && request.avatarFile.Length > 0)
            {
                // Validate file type
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
                var fileExtension = Path.GetExtension(request.avatarFile.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(fileExtension))
                {
                    throw new AppException(ErrorCode.InvalidFileType());
                }

                // Validate file size (max 5MB)
                if (request.avatarFile.Length > 5 * 1024 * 1024)
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
                var avatarFileUrl = await _blobStorageService.UploadFileAsync(request.avatarFile, "avartars", fileName);
                
                // Update avatar URL
                user.AvatarUrl = avatarFileUrl;
            }

            // Update user properties only if they are provided (partial update)
            if (!string.IsNullOrWhiteSpace(request.fullName))
            {
                user.FullName = request.fullName;
            }

            if (!string.IsNullOrWhiteSpace(request.email))
            {
                // Check if email already exists (exclude current user)
                var existingUser = await _userManager.FindByEmailAsync(request.email);
                if (existingUser != null && existingUser.Id != user.Id)
                {
                    throw new AppException(ErrorCode.EmailAlreadyExists());
                }
                user.Email = request.email;
                user.UserName = request.email; // Username is usually email
                user.NormalizedEmail = request.email.ToUpper();
                user.NormalizedUserName = request.email.ToUpper();
            }

            if (!string.IsNullOrWhiteSpace(request.phoneNumber))
            {
                user.PhoneNumber = request.phoneNumber;
            }

            if (request.address != null)
            {
                user.Address = request.address;
            }

            if (!string.IsNullOrWhiteSpace(request.gender))
            {
                if (bool.TryParse(request.gender, out var gender))
                {
                    user.Gender = gender;
                }
                else if (request.gender.Equals("Male", StringComparison.OrdinalIgnoreCase))
                {
                    user.Gender = true; // true = Male
                }
                else if (request.gender.Equals("Female", StringComparison.OrdinalIgnoreCase))
                {
                    user.Gender = false; // false = Female
                }
            }

            if (request.birthday.HasValue)
            {
                user.Birthday = request.birthday.Value;
            }

            if (request.isActive.HasValue)
            {
                // Check if user is being deactivated and is a recruiter
                var userRoles = await _unitOfWork.AuthRepository.GetRolesAsync(user);
                bool isRecruiter = userRoles.Contains("Recruiter");
                bool wasActive = user.IsActive;
                bool willBeDeactivated = !request.isActive.Value;

                user.IsActive = request.isActive.Value;

                // If recruiter is being deactivated, handle their jobs and candidates
                if (isRecruiter && wasActive && willBeDeactivated)
                {
                    await HandleRecruiterDeactivationAsync(user.Id);
                }
            }

            if (request.companyId.HasValue)
            {
                user.CompanyId = request.companyId.Value;
            }

            // Handle role update if provided
            if (!string.IsNullOrWhiteSpace(request.role))
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                if (currentRoles.Any())
                {
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);
                }

                // Check if role exists
                var roleExists = await _roleManager.RoleExistsAsync(request.role);
                if (!roleExists)
                {
                    throw new AppException(ErrorCode.RoleNotFound());
                }

                await _userManager.AddToRoleAsync(user, request.role);
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

        /// <summary>
        /// Xử lý các job và candidate applications khi recruiter bị deactivate
        /// </summary>
        /// <param name="recruiterId">ID của recruiter bị deactivate</param>
        private async Task HandleRecruiterDeactivationAsync(int recruiterId)
        {
            // Lấy tất cả jobs đang mở (Active/Opened) của recruiter này
            var activeJobs = await _unitOfWork.JobRepository.GetJobsByRecruiterIdAsync(recruiterId);
            
            if (activeJobs != null && activeJobs.Any())
            {
                foreach (var job in activeJobs)
                {
                    // Chỉ đóng những job đang mở (Draft, Moderated, Opened)
                    if (job.Status == JobStatus.Draft || 
                        job.Status == JobStatus.Moderated || 
                        job.Status == JobStatus.Opened)
                    {
                        // Đóng job
                        job.Status = JobStatus.Closed;
                        job.IsDeleted = true; // Soft delete
                        
                        await _unitOfWork.JobRepository.UpdateAsync(job);

                        // Lấy tất cả candidates đang ứng tuyển job này
                        var candidateJobs = await _unitOfWork.CandidateJobRepository.GetCandidateJobsByJobIdAsync(job.JobId);
                        
                        if (candidateJobs != null && candidateJobs.Any())
                        {
                            foreach (var candidateJob in candidateJobs)
                            {
                                // Chỉ cập nhật những ứng viên đang Pending hoặc Processing
                                if (candidateJob.Status == CandidateJobStatus.Pending || 
                                    candidateJob.Status == CandidateJobStatus.Processing)
                                {
                                    // Đánh dấu application là Failed do job bị đóng
                                    candidateJob.Status = CandidateJobStatus.Fail;
                                    await _unitOfWork.CandidateJobRepository.UpdateAsync(candidateJob);

                                    // Gửi email thông báo cho candidate (optional)
                                    try
                                    {
                                        var candidate = await _unitOfWork.AuthRepository.GetUserById(candidateJob.CVUpload?.UserId ?? 0);
                                        if (candidate != null && !string.IsNullOrEmpty(candidate.Email))
                                        {
                                            await _emailService.SendJobClosedNotificationAsync(
                                                candidate.Email,
                                                candidate.FullName,
                                                job.Title,
                                                job.Company?.Name ?? "Công ty"
                                            );
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        // Log error but don't break the flow
                                        Console.WriteLine($"Failed to send email notification: {ex.Message}");
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
