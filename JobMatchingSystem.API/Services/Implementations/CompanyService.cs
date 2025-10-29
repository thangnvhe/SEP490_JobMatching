using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
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
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;

        public CompanyService
            (ICompanyRepository companyRepository,
            ICompanyRecruiterRepository companyRecruiterRepository,
            UserManager<ApplicationUser> userManager,
            IWebHostEnvironment env,IAuthRepository authRepository,
            IMapper mapper,
            IEmailService emailService)
        {
            _companyRepository = companyRepository;
            _companyRecruiterRepository = companyRecruiterRepository;
            _userManager = userManager;
            _env = env;
            _authRepository = authRepository;
            _mapper = mapper;
            _emailService = emailService;
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
            var password = PasswordHelper.GenerateRandomPassword(12);
            var result = await _userManager.CreateAsync(user, password);
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
            var emailBody = $@"
              <h2>Chúc mừng! Công ty của bạn đã được duyệt</h2>
              <p>Tài khoản recruiter của bạn đã được tạo:</p>
              <p>Email: {company.Email}</p>
              <p>Mật khẩu: {password}</p>
              <p>Vui lòng đăng nhập và đổi mật khẩu ngay lần đầu tiên.</p>
               ";

            await _emailService.SendEmailAsync(company.Email, "Công ty được duyệt - JobMatching System", emailBody);

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
                LicenseFile = "images/LicenseFile/"+fileName,
                Address = request.Address,
                Status = Enums.CompanyStatus.Pending
            };
            await _companyRepository.AddAsync(company);
        }

        public async Task<List<CompanyDTO>> GetAllWithPending()
        {
            var ListCompany= await _companyRepository.GetAllWithPendingAsync();
            if (ListCompany == null)
            {
                return new List<CompanyDTO>();
            }
            var ListCompanyDTO= _mapper.Map<List<CompanyDTO>>(ListCompany);
            return ListCompanyDTO;
        }

        public async Task<CompanyDTO> GetDetailCompany(int companyId)
        {
            var Company=await _companyRepository.GetByIdAsync(companyId);
            if (Company == null) {
                throw new AppException(ErrorCode.NotFoundCompany());
            }
            var CompanyDTO=_mapper.Map<CompanyDTO>(Company);
            return CompanyDTO;
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
            await _companyRepository.Update(company);
            var emailBody = $@"
            <h2>Thông báo từ chối công ty</h2>
            <p>Công ty {company.CompanyName} của bạn đã bị từ chối duyệt.</p>
             <p>Vui lòng liên hệ admin để biết thêm chi tiết.</p>
    ";

            await _emailService.SendEmailAsync(company.Email, "Công ty bị từ chối - JobMatching System", emailBody);
        }
    }
}
