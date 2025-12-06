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

        public async Task<List<TaxonomyTreeResponse>> GetAllTaxonomiesAsync()
        {
            var taxonomies = await _taxonomyRepository.GetAllAsync();
            return taxonomies.Select(MapToTaxonomyResponse).ToList();
        }

        public Task<PagedResult<object>> GetAllPagedAsync(int page, int pageSize, string sortBy, bool isDescending, string search)
        {
            try
            {
                var query = _taxonomyRepository.GetQueryable();

                // Apply search filter
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(t => t.Name.ToLower().Contains(search.ToLower()));
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
                    .Select(t => new TaxonomyFlatResponse
                    {
                        Id = t.Id,
                        Name = t.Name,
                        ParentId = t.ParentId,
                        ParentName = t.ParentId.HasValue && t.Parent != null ? t.Parent.Name : null
                    })
                    .ToList();

                var items = taxonomies.Cast<object>().ToList();

                return Task.FromResult(new PagedResult<object>
                {
                    Items = items,
                    pageInfo = new PageInfo(totalCount, page, pageSize, sortBy, isDescending)
                });
            }
            catch (Exception)
            {
                return Task.FromResult(new PagedResult<object>
                {
                    Items = new List<object>(),
                    pageInfo = new PageInfo(0, page, pageSize, sortBy, isDescending)
                });
            }
        }

        public async Task<List<TaxonomyTreeResponse>> GetTaxonomyTreeAsync()
        {
            var allTaxonomies = await _taxonomyRepository.GetAllWithChildrenAsync();
            var rootTaxonomies = allTaxonomies.Where(t => t.ParentId == null).ToList();
            
            return rootTaxonomies.Select(t => MapToTaxonomyTreeResponse(t, allTaxonomies)).ToList();
        }

        public async Task<List<TaxonomyFlatResponse>> GetTaxonomyFlatListAsync()
        {
            var taxonomies = await _taxonomyRepository.GetAllWithParentAsync();
            return taxonomies.Select(MapToTaxonomyFlatResponse).ToList();
        }

        public async Task<List<TaxonomyTreeResponse>> GetChildrenByParentIdAsync(int parentId)
        {
            var children = await _taxonomyRepository.GetChildrenByParentIdAsync(parentId);
            return children.Select(MapToTaxonomyResponse).ToList();
        }

        public async Task<TaxonomyTreeResponse?> GetTaxonomyByIdAsync(int id)
        {
            var taxonomy = await _taxonomyRepository.GetByIdAsync(id);
            return taxonomy != null ? MapToTaxonomyResponse(taxonomy) : null;
        }

        public async Task<List<TaxonomyTreeResponse>> GetRootTaxonomiesAsync()
        {
            return await _taxonomyRepository.GetRootTaxonomiesAsync().ContinueWith(t => 
                t.Result.Select(MapToTaxonomyResponse).ToList());
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

        private static TaxonomyTreeResponse MapToTaxonomyResponse(Taxonomy taxonomy)
        {
            return new TaxonomyTreeResponse
            {
                Id = taxonomy.Id,
                Name = taxonomy.Name,
                ParentId = taxonomy.ParentId,
                Children = new List<TaxonomyTreeResponse>()
            };
        }

        private static TaxonomyTreeResponse MapToTaxonomyTreeResponse(Taxonomy taxonomy, List<Taxonomy> allTaxonomies)
        {
            var response = MapToTaxonomyResponse(taxonomy);
            
            var children = allTaxonomies.Where(t => t.ParentId == taxonomy.Id).ToList();
            response.Children = children.Select(c => MapToTaxonomyTreeResponse(c, allTaxonomies)).ToList();
            
            return response;
        }

        private static TaxonomyFlatResponse MapToTaxonomyFlatResponse(Taxonomy taxonomy)
        {
            return new TaxonomyFlatResponse
            {
                Id = taxonomy.Id,
                Name = taxonomy.Name,
                ParentId = taxonomy.ParentId,
                ParentName = taxonomy.Parent?.Name,
                HasChildren = taxonomy.Children?.Any() == true
            };
        }
    }
}
