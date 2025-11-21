using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class JobTaxonomyService : IJobTaxonomyService
    {
        private readonly IJobTaxonomyRepository _repository;

        public JobTaxonomyService(IJobTaxonomyRepository repository)
        {
            _repository = repository;
        }

        public async Task<JobTaxonomyResponse> GetByIdAsync(int id)
        {
            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)
                throw new AppException(ErrorCode.NotFoundJobTaxonomy());

            return new JobTaxonomyResponse
            {
                Id = entity.Id,
                JobId = entity.JobId,
                TaxonomyId = entity.TaxonomyId,
                TaxonomyName = entity.Taxonomy?.Name
            };
        }

        public async Task<List<JobTaxonomyResponse>> GetByJobIdAsync(int jobId)
        {
            var list = await _repository.GetByJobIdAsync(jobId);

            return list.Select(x => new JobTaxonomyResponse
            {
                Id = x.Id,
                JobId = x.JobId,
                TaxonomyId = x.TaxonomyId,
                TaxonomyName = x.Taxonomy?.Name
            }).ToList();
        }

        public async Task CreateAsync(CreateJobTaxonomyRequest request, int userId)
        {
            // kiểm tra job có thuộc recruiter hay không
            var job = await _repository.GetJobAsync(request.JobId);
            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            if (job.RecuiterId != userId)
                throw new AppException(ErrorCode.NotFoundJobTaxonomy());

            bool taxonomyExists = await _repository.TaxonomyExistsAsync(request.TaxonomyId);
            if (!taxonomyExists)
                throw new AppException(ErrorCode.NotFoundTaxonomy());

            var entity = new JobTaxonomy
            {
                JobId = request.JobId,
                TaxonomyId = request.TaxonomyId
            };

            await _repository.CreateAsync(entity);
        }

        public async Task DeleteAsync(int id, int userId)
        {
            var entity = await _repository.GetByIdAsync(id);

            if (entity == null)
                throw new AppException(ErrorCode.NotFoundJobTaxonomy());

            var job = await _repository.GetJobAsync(entity.JobId);
            if (job == null)
                throw new AppException(ErrorCode.NotFoundJob());

            if (job.RecuiterId != userId)
                throw new AppException(ErrorCode.NotFoundJobTaxonomy());

            await _repository.DeleteAsync(entity);
        }
    }
}
