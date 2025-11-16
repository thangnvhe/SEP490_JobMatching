using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CVProjectService : ICVProjectService
    {
        private readonly ICVProjectRepository _repository;

        public CVProjectService(ICVProjectRepository repository)
        {
            _repository = repository;
        }

        public async Task<CVProject> GetByIdAsync(int id)
        {
            var project = await _repository.GetByIdAsync(id);
            if (project == null)
                throw new AppException(ErrorCode.NotFoundCVProject());
            return project;
        }

        public async Task<List<CVProject>> GetByCurrentUserAsync(int userId)
        {
            if (userId == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var projects = await _repository.GetByUserIdAsync(userId);
            if (projects == null || !projects.Any())
                throw new AppException(ErrorCode.NotFoundCVProject());

            return projects;
        }

        public async Task<CVProject> CreateAsync(CVProjectRequest request, int userId)
        {
            var project = new CVProject
            {
                UserId = userId,
                ProjectName = request.ProjectName,
                Description = request.Description,
                StartDate = request.StartDate,
                EndDate = request.EndDate
            };

            await _repository.CreateAsync(project);
            return project;
        }

        public async Task<CVProject> UpdateAsync(int id, CVProjectRequest request, int userId)
        {
            if (userId == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var project = await _repository.GetByIdAsync(id);
            if (project == null || project.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCVProject());

            project.ProjectName = request.ProjectName;
            project.Description = request.Description;
            project.StartDate = request.StartDate;
            project.EndDate = request.EndDate;

            await _repository.UpdateAsync(project);
            return project;
        }

        public async Task DeleteAsync(int id, int userId)
        {
            if (userId == null)
                throw new AppException(ErrorCode.NotFoundUser());

            var project = await _repository.GetByIdAsync(id);
            if (project == null || project.UserId != userId)
                throw new AppException(ErrorCode.NotFoundCVProject());

            await _repository.DeleteAsync(project);
        }
    }
}
