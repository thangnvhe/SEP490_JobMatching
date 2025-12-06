using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TaxonomyController : ControllerBase
    {
        private readonly ITaxonomyService _taxonomyService;

        public TaxonomyController(ITaxonomyService taxonomyService)
        {
            _taxonomyService = taxonomyService;
        }

        /// <summary>
        /// Get all taxonomies
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var taxonomies = await _taxonomyService.GetAllTaxonomiesAsync();

            return Ok(APIResponse<IEnumerable<TaxonomyResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(taxonomies)
                .Build());
        }

        /// <summary>
        /// Get paginated taxonomies with search and sorting
        /// </summary>
        [HttpGet("paged")]
        public async Task<IActionResult> GetAllPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string sortBy = "", [FromQuery] bool isDescending = false, [FromQuery] string search = "", [FromQuery] bool? hasParent = null)
        {
            var pagedResult = await _taxonomyService.GetAllPagedAsync(page, pageSize, sortBy, isDescending, search, hasParent);

            return Ok(APIResponse<PagedResult<TaxonomyResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(pagedResult)
                .Build());
        }

        /// <summary>
        /// Get specific taxonomy by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var taxonomy = await _taxonomyService.GetByIdAsync(id);

            if (taxonomy == null)
            {
                return NotFound(APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .WithSuccess(false)
                    .WithResult("Taxonomy not found")
                    .Build());
            }

            return Ok(APIResponse<TaxonomyResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(taxonomy)
                .Build());
        }

        /// <summary>
        /// Get children taxonomies by parent ID
        /// </summary>
        [HttpGet("parent/{parentId}/children")]
        public async Task<IActionResult> GetChildrenByParentId(int parentId)
        {
            var children = await _taxonomyService.GetChildrenByParentIdAsync(parentId);

            return Ok(APIResponse<IEnumerable<TaxonomyResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(children)
                .Build());
        }

        /// <summary>
        /// Create a new taxonomy
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateTaxonomyRequest request)
        {
            try
            {
                var taxonomy = await _taxonomyService.CreateTaxonomyAsync(request);
                
                var response = new TaxonomyResponse
                {
                    Id = taxonomy.Id,
                    Name = taxonomy.Name,
                    ChildrenIds = Array.Empty<int>(),
                    HasChildren = false
                };

                return Ok(APIResponse<TaxonomyResponse>.Builder()
                    .WithStatusCode(HttpStatusCode.Created)
                    .WithSuccess(true)
                    .WithResult(response)
                    .Build());
            }
            catch (Exception ex)
            {
                return BadRequest(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.BadRequest)
                    .WithSuccess(false)
                    .WithMessage(ex.Message)
                    .Build());
            }
        }

        /// <summary>
        /// Update an existing taxonomy
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateTaxonomyRequest request)
        {
            try
            {
                var taxonomy = await _taxonomyService.UpdateTaxonomyAsync(id, request);
                
                // Reload to get children
                var updatedTaxonomy = await _taxonomyService.GetByIdAsync(id);
                var response = updatedTaxonomy ?? new TaxonomyResponse
                {
                    Id = taxonomy.Id,
                    Name = taxonomy.Name,
                    ChildrenIds = Array.Empty<int>(),
                    HasChildren = false
                };

                return Ok(APIResponse<TaxonomyResponse>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .WithResult(response)
                    .Build());
            }
            catch (Exception ex)
            {
                return BadRequest(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.BadRequest)
                    .WithSuccess(false)
                    .WithMessage(ex.Message)
                    .Build());
            }
        }

        /// <summary>
        /// Delete a taxonomy
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _taxonomyService.DeleteTaxonomyAsync(id);

                return Ok(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.OK)
                    .WithSuccess(true)
                    .Build());
            }
            catch (Exception ex)
            {
                return BadRequest(APIResponse<object>.Builder()
                    .WithStatusCode(HttpStatusCode.BadRequest)
                    .WithSuccess(false)
                    .WithMessage(ex.Message)
                    .Build());
            }
        }
    }
}
