using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CVCertificateService : ICVCertificateService
    {
        private readonly ICVCertificateRepository _repository;

        public CVCertificateService(ICVCertificateRepository repository)
        {
            _repository = repository;
        }

        public async Task<CVCertificate> GetByIdAsync(int id)
        {
            var certificate = await _repository.GetByIdAsync(id);
            if (certificate == null)
                throw new AppException(ErrorCode.NotFoundCVCertificate());
            return certificate;
        }

        public async Task<List<CVCertificate>> GetByCurrentUserAsync(int userId)
        {
            if (userId == null)
                throw new AppException(ErrorCode.NotFoundUser());
            var certificates = await _repository.GetByUserIdAsync(userId);
            if (certificates == null || !certificates.Any())
                throw new AppException(ErrorCode.NotFoundCVCertificate());
            return certificates;
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
            if (userId == null)
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
            if (userId == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var certificate = await _repository.GetByIdAsync(id);

            if (certificate == null || certificate.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCVCertificate());

            await _repository.DeleteAsync(certificate);
        }
    }
}
