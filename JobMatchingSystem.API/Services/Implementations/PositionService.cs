using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using JobMatchingSystem.API.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class PositionService : IPositionService
    {
        private readonly IPositionRepository _positionRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ApplicationDbContext _context;

        public PositionService(IPositionRepository positionRepository, UserManager<ApplicationUser> userManager, ApplicationDbContext context)
        {
            _positionRepository = positionRepository;
            _userManager = userManager;
            _context = context;
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

        public async Task<PagedResult<PositionResponse>> GetAllPagedAsync(int page = 1, int pageSize = 10, string sortBy = "", bool isDescending = false, string search = "")
        {
            try
            {
                var query = _context.Positions.AsQueryable();

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(p => p.Name.Contains(search));
                }

                // Apply sorting
                if (!string.IsNullOrEmpty(sortBy))
                {
                    switch (sortBy.ToLower())
                    {
                        case "name":
                            query = isDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name);
                            break;
                        case "id":
                            query = isDescending ? query.OrderByDescending(p => p.PositionId) : query.OrderBy(p => p.PositionId);
                            break;
                        default:
                            query = query.OrderBy(p => p.Name);
                            break;
                    }
                }
                else
                {
                    query = query.OrderBy(p => p.Name);
                }

                var totalCount = await query.CountAsync();
                var positions = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var positionResponses = positions.Select(p => new PositionResponse
                {
                    PositionId = p.PositionId,
                    Name = p.Name
                }).ToList();

                return new PagedResult<PositionResponse>
                {
                    Items = positionResponses,
                    pageInfo = new PageInfo(totalCount, page, pageSize, sortBy, isDescending)
                };
            }
            catch (Exception)
            {
                return new PagedResult<PositionResponse>
                {
                    Items = new List<PositionResponse>(),
                    pageInfo = new PageInfo(0, page, pageSize, sortBy, isDescending)
                };
            }
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

            // Get or create CV Profile for the candidate
            var cvProfile = await _context.CVProfiles.FirstOrDefaultAsync(cp => cp.UserId == candidateId);
            
            if (cvProfile == null)
            {
                // Create new CV Profile if not exists
                cvProfile = new CVProfile
                {
                    UserId = candidateId,
                    PositionId = positionId
                };
                _context.CVProfiles.Add(cvProfile);
            }
            else
            {
                // Update existing CV Profile
                cvProfile.PositionId = positionId;
                _context.CVProfiles.Update(cvProfile);
            }
            
            await _context.SaveChangesAsync();
        }
        
        public async Task<Position> CreatePositionAsync(CreatePositionRequest request)
        {
            var position = new Position
            {
                Name = request.Name,
            };

            var createdPosition = await _positionRepository.CreateAsync(position);
            return createdPosition;
        }

        public async Task<Position> UpdatePositionAsync(int id, UpdatePositionRequest request)
        {
            var existingPosition = await _positionRepository.GetByIdAsync(id);
            if (existingPosition == null)
                throw new AppException(ErrorCode.NotFoundPosition());

            existingPosition.Name = request.Name;

            var updatedPosition = await _positionRepository.UpdateAsync(existingPosition);
            return updatedPosition;
        }

        public async Task DeletePositionAsync(int id)
        {
            var existingPosition = await _positionRepository.GetByIdAsync(id);
            if (existingPosition == null)
                throw new AppException(ErrorCode.NotFoundPosition());

            await _positionRepository.DeleteAsync(id);
        }
    }
}
