using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICandidateJobRepository
    {
        Task Add(CandidateJob candidateJob);
        Task<List<CandidateJob>> GetByJobIdAsync(int JobId,string status, string sortBy, bool isDecending);
        Task<List<CandidateJob>> GetByUserIdAsync(int userId, string status, string sortBy, bool isDescending);
        Task<CandidateJob?> GetDetail(int id);
        Task Update(CandidateJob candidateJob);
        Task<List<CandidateJob>> GetByCandidateIdAsync(int candidateid);
        Task<bool> isApplyJob(int jobid, int cvid);
        Task<List<CandidateJob>> GetCandidateJobsByJobIdAsync(int jobId);
        Task UpdateAsync(CandidateJob candidateJob);

    }
}
