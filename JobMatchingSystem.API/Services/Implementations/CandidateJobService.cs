using AutoMapper;
using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.Design;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CandidateJobService : ICandidateJobService
    {
        protected readonly IUnitOfWork _unitOfWork;
        protected readonly IMapper _mapper;
        protected readonly ApplicationDbContext _dbContext;
        protected readonly IEmailService _emailService;
        public CandidateJobService(IUnitOfWork unitOfWork,IMapper mapper,ApplicationDbContext dbContext,IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _dbContext = dbContext;
            _emailService= emailService;
        }
        public async Task Add(CreateCandidateJobRequest request)
        {
            var job = await _unitOfWork.JobRepository.GetById(request.JobId);
            if (job == null)
            {
                throw new AppException(ErrorCode.NotFoundJob());
            }
            var cv = await _unitOfWork.CvUploadRepository.GetById(request.CVId);
            if (cv == null)
                throw new AppException(ErrorCode.NotFoundCV());
            if (await _unitOfWork.CandidateJobRepository.isApplyJob(request.JobId, request.CVId)) {
                throw new AppException(ErrorCode.IsApplyJob());
            }
            var candidatejob=_mapper.Map<CandidateJob>(request);
            candidatejob.AppliedAt=DateTime.Now;
            await _unitOfWork.CandidateJobRepository.Add(candidatejob);
            await _unitOfWork.SaveAsync();
        }

        public async Task ApproveCV(int id)
        {
            var candidatejob= await _unitOfWork.CandidateJobRepository.GetDetail(id);
            if (candidatejob == null) { 
            throw new AppException(ErrorCode.NotFoundCandidateJob());
            }
            var countNumber=await _unitOfWork.JobStageRepository.GetNumberStageById(candidatejob.JobId);
            if (countNumber == 0)
            {
                candidatejob.Status = Enums.CandidateJobStatus.Pass;
            }
            else
            {
                // Lấy JobStage đầu tiên của Job này
                var jobStages = await _unitOfWork.JobStageRepository.GetByJobIdAsync(candidatejob.JobId);
                var firstJobStage = jobStages.OrderBy(x => x.StageNumber).FirstOrDefault();
                
                if (firstJobStage == null)
                {
                    throw new AppException(ErrorCode.NotFoundJobStage());
                }
                
                CandidateStage candidateStage = new CandidateStage();
                candidateStage.CandidateJobId = candidatejob.Id ;
                candidateStage.JobStageId = firstJobStage.Id;
                candidateStage.Status=Enums.CandidateStageStatus.Draft;
                candidatejob.Status = Enums.CandidateJobStatus.Processing;
                await _unitOfWork.CandidateStageRepository.Add(candidateStage);
            }
            var cvId = _dbContext.CandidateJobs.Where(x => x.Id == id).Select(x=>x.CVId).FirstOrDefault();
            var userId= _dbContext.CVUploads.Where(x=>x.Id==cvId).Select(x=>x.UserId).FirstOrDefault();
            var user=_dbContext.Users.Where(x=>x.Id==userId).FirstOrDefault();
            var email = user.Email;
            var jobName=_dbContext.Jobs.Where(x=>x.JobId==candidatejob.JobId).Select(x=>x.Title).FirstOrDefault();
            await _emailService.SendCvPassedEmailAsync(email, jobName);
            await _unitOfWork.CandidateJobRepository.Update(candidatejob);
            await _unitOfWork.SaveAsync();
        }

        public async Task<PagedResult<CandidateJobDTO>> GetAllByJobId(int jobid,int page = 1, int size = 5, string status = "",  string sortBy = "", bool isDecending = false)
        {
            var listCandidateJob = await _unitOfWork.CandidateJobRepository.GetByJobIdAsync(jobid, status, sortBy, isDecending);
            if (listCandidateJob == null || !listCandidateJob.Any())
            {
                return new PagedResult<CandidateJobDTO>
                {
                    Items = new List<CandidateJobDTO>(),
                    pageInfo = new PageInfo(0, page, size, sortBy, isDecending)
                };
            }
            var data = listCandidateJob
           .Skip((page - 1) * size)
           .Take(size)
           .ToList();
            var candidatejobdto = _mapper.Map<List<CandidateJobDTO>>(data);
            return new PagedResult<CandidateJobDTO>
            {
                Items = candidatejobdto,
                pageInfo = new PageInfo(listCandidateJob.Count, page, size, sortBy, isDecending)
            };
        }

        public async Task<PagedResult<CandidateJobDTO>> GetAllByUserId(int userId, int page = 1, int size = 10, string status = "", string sortBy = "", bool isDescending = false)
        {
            var listCandidateJob = await _unitOfWork.CandidateJobRepository.GetByUserIdAsync(userId, status, sortBy, isDescending);
            if (listCandidateJob == null || !listCandidateJob.Any())
            {
                return new PagedResult<CandidateJobDTO>
                {
                    Items = new List<CandidateJobDTO>(),
                    pageInfo = new PageInfo(0, page, size, sortBy, isDescending)
                };
            }
            var data = listCandidateJob
               .Skip((page - 1) * size)
               .Take(size)
               .ToList();
            var candidateJobDto = _mapper.Map<List<CandidateJobDTO>>(data);
            return new PagedResult<CandidateJobDTO>
            {
                Items = candidateJobDto,
                pageInfo = new PageInfo(listCandidateJob.Count, page, size, sortBy, isDescending)
            };
        }

        public async Task<CandidateJobDTO> GetDetailById(int id)
        {
            var candidateJob = await _unitOfWork.CandidateJobRepository.GetDetail(id);
            if (candidateJob == null)
            {
                throw new AppException(ErrorCode.NotFoundCandidateJob());
            }

            var candidateJobDto = _mapper.Map<CandidateJobDTO>(candidateJob);
            return candidateJobDto;
        }

        public async Task RejectCV(int id)
        {
            var candidatejob = await _unitOfWork.CandidateJobRepository.GetDetail(id);
            if (candidatejob == null)
            {
                throw new AppException(ErrorCode.NotFoundCandidateJob());
            }
            candidatejob.Status = Enums.CandidateJobStatus.RejectCv;
            var cvId = _dbContext.CandidateJobs.Where(x => x.Id == id).Select(x => x.CVId).FirstOrDefault();
            var userId = _dbContext.CVUploads.Where(x => x.Id == cvId).Select(x => x.UserId).FirstOrDefault();
            var user = _dbContext.Users.Where(x => x.Id == userId).FirstOrDefault();
            var email = user.Email;
            var jobName = _dbContext.Jobs.Where(x => x.JobId == candidatejob.JobId).Select(x => x.Title).FirstOrDefault();
            await _emailService.SendCvFailedEmailAsync(email, jobName);
            await _unitOfWork.CandidateJobRepository.Update(candidatejob);
            await _unitOfWork.SaveAsync();
        }
    }
}
