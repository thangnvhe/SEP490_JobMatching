using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CompanyService : ICompanyService
    {
        private readonly ICompanyRepository _companyRepository;
        private readonly ICompanyRecruiterRepository _companyRecruiterRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IWebHostEnvironment _env;
        private readonly IAuthRepository _authRepository;

        public CompanyService
            (ICompanyRepository companyRepository,
            ICompanyRecruiterRepository companyRecruiterRepository,
            UserManager<ApplicationUser> userManager,
            IWebHostEnvironment env,IAuthRepository authRepository)
        {
            _companyRepository = companyRepository;
            _companyRecruiterRepository = companyRecruiterRepository;
            _userManager = userManager;
            _env = env;
            _authRepository = authRepository;
        }
        public async Task AcceptCompanyAsync(AccepRejectCompanyRequest request, int userId)
        {
            var company = await _companyRepository.GetByIdAsync(request.CompanyId);
            if (company == null)
                throw new AppException(ErrorCode.NotFoundCompany());

            company.Status = Enums.CompanyStatus.Approved;
            company.VerifiedBy = userId;
            company.VerifiedAt = DateTime.UtcNow;
            company.IsActive = true;

            var user = new ApplicationUser
            {
                UserName = company.Email,
                Email = company.Email,
            };

            var result = await _userManager.CreateAsync(user, "Recruiter@123");
            if (!result.Succeeded)
                throw new AppException(ErrorCode.InvalidCreate());

            await _userManager.AddToRoleAsync(user, Contraints.RoleRecruiter);

            var companyRecruiter = new CompanyRecruiter
            {
                CompanyId = company.CompanyId,
                UserId = user.Id,
                IsActive = true,
                JoinedAt = DateTime.UtcNow
            };

            await _companyRecruiterRepository.AddAsync(companyRecruiter);
        }

        public async Task CreateCompanyAsync(RegisterRecruiterRequest request)
        {
            if (await _authRepository.ExistsAsync(request.WorkEmail))
            {
                throw new AppException(ErrorCode.EmailExist()); 
            }
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(request.LicenseFile.FileName)}";
            var savePath = Path.Combine(_env.WebRootPath, "images", "LicenseFile", fileName);
            Directory.CreateDirectory(Path.GetDirectoryName(savePath)!);
            using (var stream = new FileStream(savePath, FileMode.Create))
            {
                await request.LicenseFile.CopyToAsync(stream);
            }
            var company = new Company
            {
                CompanyName = request.CompanyName,
                Email = request.WorkEmail,
                Website = request.WebsiteUrl,
                PhoneContact = request.PhoneNumber,
                TaxCode = request.TaxCode,
                LicenseFile = fileName,
                Address = request.Address,
                Status = Enums.CompanyStatus.Pending
            };
            await _companyRepository.AddAsync(company);
        }

        public async Task RejectCompanyAsync(AccepRejectCompanyRequest request, int userId)
        {
            var company = await _companyRepository.GetByIdAsync(request.CompanyId);
            if (company == null)
                throw new AppException(ErrorCode.NotFoundCompany());

            company.Status = Enums.CompanyStatus.Rejected;
            company.VerifiedBy = userId;
            company.VerifiedAt = DateTime.UtcNow;
            company.IsActive = true;

            var user = new ApplicationUser
            {
                UserName = company.Email,
                Email = company.Email,
            };

            var result = await _userManager.CreateAsync(user, "Recruiter@123");
            
            if (!result.Succeeded)
                throw new AppException(ErrorCode.InvalidCreate());

            await _userManager.AddToRoleAsync(user, Contraints.RoleRecruiter);

            var companyRecruiter = new CompanyRecruiter
            {
                CompanyId = company.CompanyId,
                UserId = user.Id,
                IsActive = true,
                JoinedAt = DateTime.UtcNow
            };

            await _companyRecruiterRepository.AddAsync(companyRecruiter);
        }
    }
}
