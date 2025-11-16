using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using System.ComponentModel.Design;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CandidateJobService : ICandidateJobService
    {
        protected readonly IUnitOfWork _unitOfWork;
        protected readonly IMapper _mapper;
        public CandidateJobService(IUnitOfWork unitOfWork,IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }
        public async Task Add(CreateCandidateJobRequest request)
        {
            var job = _unitOfWork.JobRepository.GetById(request.JobId);
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
            candidatejob.Status=Enums.CandidateJobStatus.Processing;
            await _unitOfWork.CandidateJobRepository.Update(candidatejob);
            await _unitOfWork.SaveAsync();
        }

        public async Task<PagedResult<CandidateJobDTO>> GetAllByJobId(int jobid,int page = 1, int size = 5, string status = "",  string sortBy = "", bool isDecending = false)
        {
            var listCandidateJob = await _unitOfWork.CandidateJobRepository.GetByJobIdAsync(jobid, status, sortBy, isDecending);
            if (listCandidateJob == null || listCandidateJob.Any())
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
            await _unitOfWork.CandidateJobRepository.Update(candidatejob);
            await _unitOfWork.SaveAsync();
        }
    }
}
