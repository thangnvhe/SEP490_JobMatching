using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class JobStageService : IJobStageService
    {
        private readonly IJobStageRepository _repo;
        private readonly ApplicationDbContext _context;

        public JobStageService(IJobStageRepository repo, ApplicationDbContext context)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<List<JobStageResponse>> GetByJobIdAsync(int jobId)
        {
            var stages = await _context.JobStages
                .Include(js => js.HiringManager)
                .Where(js => js.JobId == jobId)
                .OrderBy(js => js.StageNumber)
                .ToListAsync();

            if (stages == null || !stages.Any())
                throw new AppException(ErrorCode.NotFoundJobStage());

            return stages.Select(s => new JobStageResponse
            {
                Id = s.Id,
                JobId = s.JobId,
                StageNumber = s.StageNumber,
                Name = s.Name,
                HiringManagerId = s.HiringManagerId,
                HiringManagerName = s.HiringManager?.FullName
            }).ToList();
        }

        public async Task<JobStageResponse?> GetByIdAsync(int id)
        {
            var s = await _context.JobStages
                .Include(js => js.HiringManager)
                .FirstOrDefaultAsync(js => js.Id == id);

            if (s == null)
                throw new AppException(ErrorCode.NotFoundJobStage());

            return new JobStageResponse
            {
                Id = s.Id,
                JobId = s.JobId,
                StageNumber = s.StageNumber,
                Name = s.Name,
                HiringManagerId = s.HiringManagerId,
                HiringManagerName = s.HiringManager?.FullName
            };
        }

        public async Task CreateAsync(JobStageRequest request)
        {
            var jobExists = await _context.Jobs.AnyAsync(x => x.JobId == request.JobId);
            if (!jobExists)
                throw new AppException(ErrorCode.NotFoundJob());

            var stage = new JobStage
            {
                JobId = request.JobId,
                StageNumber = request.StageNumber,
                Name = request.Name,
                HiringManagerId = request.HiringManagerId
            };

            await _repo.CreateAsync(stage);
        }

        public async Task UpdateAsync(int id, UpdateJobStageRequest request)
        {
            var stage = await _repo.GetByIdAsync(id);
            if (stage == null)
                throw new AppException(ErrorCode.NotFoundJobStage());

            stage.StageNumber = request.StageNumber;
            stage.Name = request.Name;
            stage.HiringManagerId = request.HiringManagerId;

            await _repo.UpdateAsync(stage);
        }

        public async Task DeleteAsync(int id)
        {
            var stage = await _repo.GetByIdAsync(id);
            if (stage == null)
                throw new AppException(ErrorCode.NotFoundJobStage());

            // ❗ Check xem có CandidateStage hay chưa
            bool hasCandidateStages = await _context.CandidateStages
                .AnyAsync(cs => cs.JobStageId == id);

            if (hasCandidateStages)
                throw new AppException(ErrorCode.CantDelete());

            await _repo.DeleteAsync(stage);
        }

    }
}
