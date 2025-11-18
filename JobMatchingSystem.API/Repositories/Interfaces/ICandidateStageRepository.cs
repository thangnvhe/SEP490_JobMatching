using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICandidateStageRepository
    {
        Task Add(CandidateStage candidateStage);
        Task<List<CandidateStage>> GetAllCandidateStageByJobStageId(int jobstageId,string status,string sortBy,bool IsDecending);
        Task<CandidateStage?> GetDetailById(int id);
        Task Update(CandidateStage candidateStage);
    }
}
