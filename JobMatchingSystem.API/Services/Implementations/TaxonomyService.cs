using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class TaxonomyService : ITaxonomyService
    {
        private readonly ITaxonomyRepository _taxonomyRepository;

        public TaxonomyService(ITaxonomyRepository taxonomyRepository)
        {
            _taxonomyRepository = taxonomyRepository;
        }

        public async Task<IEnumerable<TaxonomyResponse>> GetAllTaxonomiesAsync()
        {
            var taxonomies = await _taxonomyRepository.GetAllAsync();
            return taxonomies.Select(t => new TaxonomyResponse
            {
                Id = t.Id,
                Name = t.Name,
                ParentId = t.ParentId
            }).ToList();
        }

        public Task<PagedResult<TaxonomyResponse>> GetAllPagedAsync(int page, int pageSize, string sortBy, bool isDescending, string search, bool? hasParent = null)
        {
            try
            {
                var query = _taxonomyRepository.GetQueryable();

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(t => t.Name.ToLower().Contains(search.ToLower()));
                }

                // Apply parent filter
                if (hasParent.HasValue)
                {
                    query = hasParent.Value 
                        ? query.Where(t => t.ParentId != null)  // Has parent
                        : query.Where(t => t.ParentId == null); // No parent (root)
                }

                // Apply sorting
                if (!string.IsNullOrEmpty(sortBy))
                {
                    switch (sortBy.ToLower())
                    {
                        case "name":
                            query = isDescending ? query.OrderByDescending(t => t.Name) : query.OrderBy(t => t.Name);
                            break;
                        case "id":
                            query = isDescending ? query.OrderByDescending(t => t.Id) : query.OrderBy(t => t.Id);
                            break;
                        case "parentid":
                            query = isDescending ? query.OrderByDescending(t => t.ParentId) : query.OrderBy(t => t.ParentId);
                            break;
                        default:
                            query = query.OrderBy(t => t.Name);
                            break;
                    }
                }
                else
                {
                    query = query.OrderBy(t => t.Name);
                }

                var totalCount = query.Count();
                var taxonomies = query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(t => new TaxonomyResponse
                    {
                        Id = t.Id,
                        Name = t.Name,
                        ParentId = t.ParentId
                    })
                    .ToList();

                return Task.FromResult(new PagedResult<TaxonomyResponse>
                {
                    Items = taxonomies,
                    pageInfo = new PageInfo(totalCount, page, pageSize, sortBy, isDescending)
                });
            }
            catch (Exception)
            {
                return Task.FromResult(new PagedResult<TaxonomyResponse>
                {
                    Items = new List<TaxonomyResponse>(),
                    pageInfo = new PageInfo(0, page, pageSize, sortBy, isDescending)
                });
            }
        }

        public async Task<TaxonomyResponse?> GetByIdAsync(int id)
        {
            var taxonomy = await _taxonomyRepository.GetByIdAsync(id);
            if (taxonomy == null) return null;

            return new TaxonomyResponse
            {
                Id = taxonomy.Id,
                Name = taxonomy.Name,
                ParentId = taxonomy.ParentId
            };
        }

        public async Task<IEnumerable<TaxonomyResponse>> GetChildrenByParentIdAsync(int parentId)
        {
            var children = await _taxonomyRepository.GetChildrenByParentIdAsync(parentId);
            return children.Select(t => new TaxonomyResponse
            {
                Id = t.Id,
                Name = t.Name,
                ParentId = t.ParentId
            }).ToList();
        }



        public async Task<Taxonomy> CreateTaxonomyAsync(CreateTaxonomyRequest request)
        {
            // Validate parent exists if ParentId is provided
            if (request.ParentId.HasValue)
            {
                var parent = await _taxonomyRepository.GetByIdAsync(request.ParentId.Value);
                if (parent == null)
                    throw new AppException(ErrorCode.NotFoundTaxonomy());
            }

            // Check for duplicate name in the same level (same ParentId)
            var isDuplicate = await _taxonomyRepository.ExistsByNameAndParentAsync(request.Name, request.ParentId);
            if (isDuplicate)
                throw new AppException(ErrorCode.AlreadyExists());

            var taxonomy = new Taxonomy
            {
                Name = request.Name,
                ParentId = request.ParentId
            };

            return await _taxonomyRepository.CreateAsync(taxonomy);
        }

        public async Task<Taxonomy> UpdateTaxonomyAsync(int id, UpdateTaxonomyRequest request)
        {
            var existingTaxonomy = await _taxonomyRepository.GetByIdAsync(id);
            if (existingTaxonomy == null)
                throw new AppException(ErrorCode.NotFoundTaxonomy());

            // Validate parent exists if ParentId is provided and prevent circular reference
            if (request.ParentId.HasValue)
            {
                if (request.ParentId.Value == id)
                    throw new AppException(ErrorCode.CantUpdate());

                var parent = await _taxonomyRepository.GetByIdAsync(request.ParentId.Value);
                if (parent == null)
                    throw new AppException(ErrorCode.NotFoundTaxonomy());

                // Check for circular reference (prevent setting parent to a descendant)
                if (await IsDescendant(id, request.ParentId.Value))
                    throw new AppException(ErrorCode.CantUpdate());
            }

            // Check for duplicate name in the same level (same ParentId), excluding current taxonomy
            var isDuplicate = await _taxonomyRepository.ExistsByNameAndParentAsync(request.Name, request.ParentId, id);
            if (isDuplicate)
                throw new AppException(ErrorCode.AlreadyExists());

            existingTaxonomy.Name = request.Name;
            existingTaxonomy.ParentId = request.ParentId;

            return await _taxonomyRepository.UpdateAsync(existingTaxonomy);
        }

        public async Task DeleteTaxonomyAsync(int id)
        {
            var existingTaxonomy = await _taxonomyRepository.GetByIdAsync(id);
            if (existingTaxonomy == null)
                throw new AppException(ErrorCode.NotFoundTaxonomy());

            await _taxonomyRepository.DeleteAsync(id);
        }

        private async Task<bool> IsDescendant(int ancestorId, int potentialDescendantId)
        {
            var children = await _taxonomyRepository.GetChildrenByParentIdAsync(ancestorId);
            
            foreach (var child in children)
            {
                if (child.Id == potentialDescendantId)
                    return true;
                
                if (await IsDescendant(child.Id, potentialDescendantId))
                    return true;
            }
            
            return false;
        }


    }
}
