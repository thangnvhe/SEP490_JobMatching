using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class PositionService : IPositionService
    {
        private readonly IPositionRepository _positionRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        public PositionService(IPositionRepository positionRepository, UserManager<ApplicationUser> userManager)
        {
            _positionRepository = positionRepository;
            _userManager = userManager;
        }

        public async Task<IEnumerable<PositionResponse>> GetAllAsync()
        {
            var positions = await _positionRepository.GetAllAsync();

            return positions.Select(p => new PositionResponse
            {
                PositionId = p.PositionId,
                Name = p.Name
            });
        }

        public async Task<PositionResponse> GetByIdAsync(int id)
        {
            var position = await _positionRepository.GetByIdAsync(id);

            if (position == null)
                throw new AppException(ErrorCode.NotFoundPosition());

            return new PositionResponse
            {
                PositionId = position.PositionId,
                Name = position.Name
            };
        }

        public async Task<PositionResponse> CreateAsync(int candidateId, int positionId)
        {
            // This method seems to have incorrect signature based on usage
            // It should probably create a new position for a candidate
            // But for now, let's implement based on the current interface
            
            var position = await _positionRepository.GetByIdAsync(positionId);
            if (position == null)
                throw new AppException(ErrorCode.NotFoundPosition());

            return new PositionResponse
            {
                PositionId = position.PositionId,
                Name = position.Name
            };
        }

        public async Task UpdateCandidatePositionAsync(int candidateId, int positionId)
        {
            // Verify position exists
            var position = await _positionRepository.GetByIdAsync(positionId);
            if (position == null)
                throw new AppException(ErrorCode.NotFoundPosition());

            // Get candidate user
            var candidate = await _userManager.FindByIdAsync(candidateId.ToString());
            if (candidate == null)
                throw new AppException(ErrorCode.NotFoundUser());

            // Update candidate's position
            candidate.PositionId = positionId;
            
            var result = await _userManager.UpdateAsync(candidate);
            if (!result.Succeeded)
            {
                throw new AppException(new Error("Failed to update candidate position", System.Net.HttpStatusCode.BadRequest));
            }
        }
    }
}
