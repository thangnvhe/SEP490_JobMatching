using AutoMapper;
using Azure.Core;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
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
        public CompanyService(IUnitOfWork unitOfWork, IWebHostEnvironment env,IMapper mapper, UserManager<ApplicationUser> userManager,IEmailService emailService) {
        _unitOfWork = unitOfWork;
        _env = env;
        _mapper = mapper;
        _userManager = userManager;
        _emailService = emailService;
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
            if (await _unitOfWork.AuthRepository.ExistsAsync(request.Email))
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
            var company = _mapper.Map<Company>(request);
            company.LicenseFile = Path.Combine("images", "LicenseFile", fileName);
            company.Logo = "Empty";
            await _unitOfWork.CompanyRepository.AddAsync(company);
            await _unitOfWork.SaveAsync();
            var randomPassword = Guid.NewGuid().ToString("N").Substring(0, 10) + "aA1!";
            var recruiter = new ApplicationUser
            {
                FullName = request.FullName,
                Email = request.Email,
                UserName = request.Email,
                EmailConfirmed = false,
                CompanyId=company.Id,
            };
            var result = await _userManager.CreateAsync(recruiter, randomPassword);
            await _userManager.AddToRoleAsync(recruiter, Contraints.RoleRecruiter);

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
        }
        public async Task<CompanyDTO> GetDetailCompany(int companyId)
        {
            var Company = await _unitOfWork.CompanyRepository.GetByIdAsync(companyId);
            if (Company == null)
            {
                throw new AppException(ErrorCode.NotFoundCompany());
            }
            var CompanyDTO = _mapper.Map<CompanyDTO>(Company);
            return CompanyDTO;
        }

        public async Task<PagedResult<CompanyDTO>> GetDetailCompanyList(int page = 1, int size = 5, string search = "", string sortBy = "", bool isDecending = false,string status="")
        {
            var listCompany = await _unitOfWork.CompanyRepository.GetAll(search,status, sortBy, isDecending);
            if (listCompany == null || !listCompany.Any())
            {
                return new PagedResult<CompanyDTO>
                {
                    Items = new List<CompanyDTO>(),
                    pageInfo = new PageInfo(0, page, size, sortBy, isDecending)
                };
            }
            var companys = listCompany
           .Skip((page - 1) * size)
           .Take(size)
           .ToList();
            var companydtos = _mapper.Map<List<CompanyDTO>>(companys);
            return new PagedResult<CompanyDTO>
            {
                Items = companydtos,
                pageInfo = new PageInfo(listCompany.Count, page, size, sortBy, isDecending)
            };
        }

        public async Task ChangeStatus(int companyId)
        {
            var company= await _unitOfWork.CompanyRepository.GetByIdAsync(companyId);
            if (company == null)
            {
                throw new AppException(ErrorCode.NotFoundCompany());
            }
            await _unitOfWork.CompanyRepository.ChangeStatus(company);
            await _unitOfWork.SaveAsync();

        }

        public async Task UpdateCompany(UpdateCompanyRequest request, int companyId)
        {
            var company = await _unitOfWork.CompanyRepository.GetByIdAsync(companyId);
            _mapper.Map(request,company);
            if (request.Logo != null)
            {
                if (!string.IsNullOrEmpty(company.Logo))
                {
                    var oldLogoPath = Path.Combine(_env.WebRootPath, company.Logo);
                    if (System.IO.File.Exists(oldLogoPath))
                    {
                        System.IO.File.Delete(oldLogoPath);
                    }
                }
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(request.Logo.FileName)}";
                var savePath = Path.Combine(_env.WebRootPath, "images", "Logo", fileName);
                Directory.CreateDirectory(Path.GetDirectoryName(savePath)!);
                using var stream = new FileStream(savePath, FileMode.Create);
                await request.Logo.CopyToAsync(stream);

                company.Logo = Path.Combine("images", "Logo", fileName);
            }

            await _unitOfWork.SaveAsync();
        }

        
    }
}
