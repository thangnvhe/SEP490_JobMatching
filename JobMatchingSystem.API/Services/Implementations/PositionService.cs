using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class PositionService : IPositionService
    {
        private readonly IPositionRepository _positionRepository;

        public PositionService(IPositionRepository positionRepository)
        {
            _positionRepository = positionRepository;
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
    }
}
