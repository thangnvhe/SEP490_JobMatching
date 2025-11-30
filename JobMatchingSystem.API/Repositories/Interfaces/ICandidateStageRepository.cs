using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Repositories.Interfaces
{
    public interface ICandidateStageRepository
    {
        Task Add(CandidateStage candidateStage);
        Task<CandidateStage?> GetDetailById(int id);
        Task Update(CandidateStage candidateStage);
        Task<List<CandidateStage>> GetCandidateDetailsByJobStageId(int jobStageId, string? status = null);
        Task<List<CandidateStage>> GetAllAsync();
    }
}
