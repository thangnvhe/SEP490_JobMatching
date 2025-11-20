using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CVCertificateService : ICVCertificateService
    {
        private readonly ICVCertificateRepository _repository;
        private readonly UserManager<ApplicationUser> _userManager;

        public CVCertificateService(ICVCertificateRepository repository, UserManager<ApplicationUser> userManager)
        {
            _repository = repository;
            _userManager = userManager;
        }

        public async Task<CVCertificate> GetByIdAsync(int id)
        {
            var certificate = await _repository.GetByIdAsync(id);
            if (certificate == null)
                throw new AppException(ErrorCode.NotFoundCVCertificate());
            return certificate;
        }

        public async Task<List<CVCertificateDto>> GetByCurrentUserAsync(int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var certificates = await _repository.GetByUserIdAsync(userId);

            if (!certificates.Any())
                throw new AppException(ErrorCode.NotFoundCVCertificate());

            return certificates.Select(c => new CVCertificateDto
            {
                Id = c.Id,
                Name = c.Name,
                Organization = c.Organization,
                Link = c.Link,
                Description = c.Description,
                CertificateAt = c.CertificateAt
            }).ToList();
        }

        public async Task<CVCertificate> CreateAsync(CVCertificateRequest request, int userId)
        {
            var certificate = new CVCertificate
            {
                UserId = userId,
                Name = request.Name,
                Organization = request.Organization,
                Link = request.Link,
                Description = request.Description,
                CertificateAt = request.CertificateAt
            };

            await _repository.CreateAsync(certificate);
            return certificate;
        }

        public async Task<CVCertificate> UpdateAsync(int id, CVCertificateRequest request, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var certificate = await _repository.GetByIdAsync(id);

            if (certificate == null || certificate.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCVCertificate());

            certificate.Name = request.Name;
            certificate.Organization = request.Organization;
            certificate.Link = request.Link;
            certificate.Description = request.Description;
            certificate.CertificateAt = request.CertificateAt;

            await _repository.UpdateAsync(certificate);
            return certificate;
        }

        public async Task DeleteAsync(int id, int userId)
        {
            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Id == userId);
            if (user == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var certificate = await _repository.GetByIdAsync(id);

            if (certificate == null || certificate.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCVCertificate());

            await _repository.DeleteAsync(certificate);
        }
    }
}
