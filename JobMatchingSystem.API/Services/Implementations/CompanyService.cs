using AutoMapper;
using Azure.Core;
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
using System.Web;


namespace JobMatchingSystem.API.Services.Implementations
{
    public class CompanyService : ICompanyService
    {
        protected readonly IUnitOfWork _unitOfWork;
        protected readonly IWebHostEnvironment _env;
        protected readonly IMapper _mapper;
        protected readonly UserManager<ApplicationUser> _userManager;
        protected readonly IEmailService _emailService;
        protected readonly ITaxCodeValidationService _taxCodeValidationService;
        protected readonly IBlobStorageService _blobStorageService;
        
        public CompanyService(
            IUnitOfWork unitOfWork, 
            IWebHostEnvironment env,
            IMapper mapper, 
            UserManager<ApplicationUser> userManager,
            IEmailService emailService,
            ITaxCodeValidationService taxCodeValidationService,
            IBlobStorageService blobStorageService) 
        {
            _unitOfWork = unitOfWork;
            _env = env;
            _mapper = mapper;
            _userManager = userManager;
            _emailService = emailService;
            _taxCodeValidationService = taxCodeValidationService;
            _blobStorageService = blobStorageService;
        }

        public async Task AcceptCompany(int id,int verifyBy)
        {
            var company= await _unitOfWork.CompanyRepository.GetByIdAsync(id);
            if (company == null)
            {
                throw new AppException(ErrorCode.NotFoundCompany());
            }
            company.Status= Enums.CompanyStatus.Approved;
            company.VerifiedBy = verifyBy;
            company.VerifiedAt = DateTime.UtcNow;
            await _unitOfWork.SaveAsync();
            var user = await _unitOfWork.AuthRepository.FindUserByCompanyId(company.Id);
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = HttpUtility.UrlEncode(token);
            await _emailService.SendCompanyApprovedEmailAsync(
            user.Email,
            user.FullName ?? user.Email,
            encodedToken,
            company.Name
    );
        }

        public async Task Add(CreateCompanyRequest request)
        {
            try
            {
                // Validate email first
                if (await _unitOfWork.AuthRepository.ExistsAsync(request.Email))
                {
                    throw new AppException(ErrorCode.EmailExist());
                }
                
                // Validate tax code with external API
                var taxCodeValidation = await _taxCodeValidationService.ValidateTaxCodeAsync(request.TaxCode);
                if (!taxCodeValidation.IsValid)
                {
                    throw new AppException(ErrorCode.InvalidFile(taxCodeValidation.ErrorMessage));
                }
                
                // Check if tax code already exists in database
                var existingCompany = await _unitOfWork.CompanyRepository.GetByTaxCodeAsync(request.TaxCode);
                if (existingCompany != null)
                {
                    throw new AppException(ErrorCode.InvalidFile("Mã số thuế này đã được đăng ký bởi công ty khác"));
                }

                // Handle license file upload to Azure Blob Storage
                var licenseFileName = $"license_{Guid.NewGuid()}{Path.GetExtension(request.LicenseFile.FileName)}";
                var licenseFileUrl = await _blobStorageService.UploadFileAsync(request.LicenseFile, "licenses", licenseFileName);

                // Create company entity
                var company = _mapper.Map<Company>(request);
                company.LicenseFile = licenseFileUrl;
                company.Logo = "Empty";
                
                // Save company first
                await _unitOfWork.CompanyRepository.AddAsync(company);
                await _unitOfWork.SaveAsync();

                // Generate password and create user
                var randomPassword = "Recruiter123@";
                var recruiter = new ApplicationUser
                {
                    FullName = request.FullName,
                    Email = request.Email,
                    UserName = request.Email,
                    EmailConfirmed = false,
                    CompanyId = company.Id,
                };

                var result = await _userManager.CreateAsync(recruiter, randomPassword);
                if (!result.Succeeded)
                {
                    // If user creation fails, log the errors
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    throw new AppException(ErrorCode.CreateUserFailed(errors));
                }

                await _userManager.AddToRoleAsync(recruiter, Contraints.RoleRecruiter);
            }
            catch (Exception ex) when (!(ex is AppException))
            {
                // Log the actual exception for debugging
                throw new AppException(ErrorCode.InvalidCreate());
            }
        }
        public async Task RejectCompany(int id, int verifyBy, string rejectReason)
        {
            var company = await _unitOfWork.CompanyRepository.GetByIdAsync(id);
            if (company == null)
            {
                throw new AppException(ErrorCode.NotFoundCompany());
            }

            company.Status = Enums.CompanyStatus.Rejected;
            company.VerifiedBy = verifyBy;
            company.VerifiedAt = DateTime.UtcNow;
            company.RejectReason = rejectReason;
            await _unitOfWork.SaveAsync();

            var user = await _unitOfWork.AuthRepository.FindUserByCompanyId(company.Id);
            await _emailService.SendCompanyRejectedEmailAsync(
                user.Email,
                user.FullName ?? user.Email,
                company.Name,
                rejectReason
            );

            // Clean up uploaded files when company is rejected
            await CleanupCompanyFilesAsync(company);
        }

        private async Task CleanupCompanyFilesAsync(Company company)
        {
            try
            {
                // Delete license file
                if (!string.IsNullOrEmpty(company.LicenseFile) && company.LicenseFile != "Empty")
                {
                    await _blobStorageService.DeleteFileAsync(company.LicenseFile);
                }

                // Delete logo
                if (!string.IsNullOrEmpty(company.Logo) && company.Logo != "Empty")
                {
                    await _blobStorageService.DeleteFileAsync(company.Logo);
                }
            }
            catch (Exception)
            {
                // Log error but don't throw - file cleanup shouldn't break the main flow
                // You might want to add proper logging here
            }
        }
        public async Task<CompanyDTO> GetDetailCompany(int companyId)
        {
            var company = await _unitOfWork.CompanyRepository.GetByIdAsync(companyId);
            if (company == null)
            {
                throw new AppException(ErrorCode.NotFoundCompany());
            }
            
            var companyDTO = _mapper.Map<CompanyDTO>(company);
            
            // Generate secure URLs with SAS tokens for file access
            companyDTO.Logo = await _blobStorageService.GetSecureFileUrlAsync(company.Logo);
            companyDTO.LicenseFile = await _blobStorageService.GetSecureFileUrlAsync(company.LicenseFile);
            
            return companyDTO;
        }

        public async Task<PagedResult<CompanyDTO>> GetDetailCompanyList(int page = 1, int size = 5, string search = "", string sortBy = "", bool isDecending = false, string status = "")
        {
            var listCompany = await _unitOfWork.CompanyRepository.GetAll(search, status, sortBy, isDecending);
            if (listCompany == null || !listCompany.Any())
            {
                return new PagedResult<CompanyDTO>
                {
                    Items = new List<CompanyDTO>(),
                    pageInfo = new PageInfo(0, page, size, sortBy, isDecending)
                };
            }
            
            var companies = listCompany
                .Skip((page - 1) * size)
                .Take(size)
                .ToList();
                
            var companyDTOs = _mapper.Map<List<CompanyDTO>>(companies);
            
            // Generate secure URLs with SAS tokens for all companies
            foreach (var companyDTO in companyDTOs)
            {
                var originalCompany = companies.First(c => c.Id == companyDTO.Id);
                companyDTO.Logo = await _blobStorageService.GetSecureFileUrlAsync(originalCompany.Logo);
                companyDTO.LicenseFile = await _blobStorageService.GetSecureFileUrlAsync(originalCompany.LicenseFile);
            }
            
            return new PagedResult<CompanyDTO>
            {
                Items = companyDTOs,
                pageInfo = new PageInfo(listCompany.Count, page, size, sortBy, isDecending)
            };
        }

        public async Task<IEnumerable<CompanyDTO>> GetAllCompaniesAsync()
        {
            var companies = await _unitOfWork.CompanyRepository.GetAllAsync();
            if (companies == null || !companies.Any())
            {
                return new List<CompanyDTO>();
            }
            
            var companyDTOs = _mapper.Map<List<CompanyDTO>>(companies);
            
            // Generate secure URLs with SAS tokens for all companies
            foreach (var companyDTO in companyDTOs)
            {
                var originalCompany = companies.First(c => c.Id == companyDTO.Id);
                companyDTO.Logo = await _blobStorageService.GetSecureFileUrlAsync(originalCompany.Logo);
                companyDTO.LicenseFile = await _blobStorageService.GetSecureFileUrlAsync(originalCompany.LicenseFile);
            }
            
            return companyDTOs;
        }

        public async Task ChangeStatus(int companyId)
        {
            var company = await _unitOfWork.CompanyRepository.GetByIdAsync(companyId);
            if (company == null)
            {
                throw new AppException(ErrorCode.NotFoundCompany());
            }

            // Check if company is being deactivated
            bool wasActive = company.IsActive;
            
            await _unitOfWork.CompanyRepository.ChangeStatus(company);

            // If company is being deactivated, handle its users, jobs and candidates
            if (wasActive && !company.IsActive)
            {
                await HandleCompanyDeactivationAsync(companyId);
            }

            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateCompany(UpdateCompanyRequest request, int companyId)
        {
            var company = await _unitOfWork.CompanyRepository.GetByIdAsync(companyId);
            _mapper.Map(request, company);
            
            if (request.Logo != null)
            {
                // Delete old logo from Azure Blob Storage if exists
                if (!string.IsNullOrEmpty(company.Logo) && company.Logo != "Empty")
                {
                    await _blobStorageService.DeleteFileAsync(company.Logo);
                }
                
                // Upload new logo to Azure Blob Storage
                var logoFileName = $"logo_{Guid.NewGuid()}{Path.GetExtension(request.Logo.FileName)}";
                var logoFileUrl = await _blobStorageService.UploadFileAsync(request.Logo, "company-logos", logoFileName);
                
                company.Logo = logoFileUrl;
            }

            await _unitOfWork.SaveAsync();
        }

        public async Task<CompanyDTO> GetMyCompanyAsync(int recruiterId)
        {
            // Find the user first
            var recruiter = await _userManager.FindByIdAsync(recruiterId.ToString());
            if (recruiter == null)
                throw new AppException(ErrorCode.NotFoundUser());

            // Check if user has Recruiter role
            var isRecruiter = await _userManager.IsInRoleAsync(recruiter, "Recruiter");
            if (!isRecruiter)
                throw new AppException(new Error("User is not a recruiter", System.Net.HttpStatusCode.Forbidden));

            // Get company by recruiter's CompanyId
            if (recruiter.CompanyId == null)
                throw new AppException(new Error("Recruiter is not associated with any company", System.Net.HttpStatusCode.NotFound));

            var company = await _unitOfWork.CompanyRepository.GetByIdAsync(recruiter.CompanyId.Value);
            if (company == null)
                throw new AppException(ErrorCode.NotFoundCompany());

            return _mapper.Map<CompanyDTO>(company);
        }

        /// <summary>
        /// Xử lý khi công ty bị deactivate - disable users, close jobs, notify candidates
        /// </summary>
        /// <param name="companyId">ID của công ty bị deactivate</param>
        private async Task HandleCompanyDeactivationAsync(int companyId)
        {
            // 1. Deactivate tất cả users thuộc công ty (Recruiters & Hiring Managers)
            var companyUsers = await _unitOfWork.AuthRepository.GetUsersByCompanyIdAsync(companyId);
            if (companyUsers != null && companyUsers.Any())
            {
                foreach (var user in companyUsers)
                {
                    if (user.IsActive)
                    {
                        user.IsActive = false;
                        await _unitOfWork.AuthRepository.UpdateUserAsync(user);
                    }
                }
            }

            // 2. Lấy tất cả jobs của công ty và đóng chúng
            var companyJobs = await _unitOfWork.JobRepository.GetJobsByCompanyIdAsync(companyId);
            if (companyJobs != null && companyJobs.Any())
            {
                foreach (var job in companyJobs)
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

                        // 3. Xử lý tất cả candidates đang ứng tuyển job này
                        var candidateJobs = await _unitOfWork.CandidateJobRepository.GetCandidateJobsByJobIdAsync(job.JobId);
                        
                        if (candidateJobs != null && candidateJobs.Any())
                        {
                            foreach (var candidateJob in candidateJobs)
                            {
                                // Chỉ cập nhật những ứng viên đang Pending hoặc Processing
                                if (candidateJob.Status == CandidateJobStatus.Pending || 
                                    candidateJob.Status == CandidateJobStatus.Processing)
                                {
                                    // Đánh dấu application là Failed do công ty ngừng hoạt động
                                    candidateJob.Status = CandidateJobStatus.Fail;
                                    await _unitOfWork.CandidateJobRepository.UpdateAsync(candidateJob);

                                    // 4. Gửi email thông báo cho candidate
                                    try
                                    {
                                        var candidate = await _unitOfWork.AuthRepository.GetUserById(candidateJob.CVUpload?.UserId ?? 0);
                                        if (candidate != null && !string.IsNullOrEmpty(candidate.Email))
                                        {
                                            await _emailService.SendCompanyClosedNotificationAsync(
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
                                        Console.WriteLine($"Failed to send company closure email notification: {ex.Message}");
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
