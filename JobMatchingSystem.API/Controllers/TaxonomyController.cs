using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
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
        /// Get all taxonomies as flat list
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var taxonomies = await _taxonomyService.GetAllTaxonomiesAsync();

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(taxonomies)
                .Build());
        }

        /// <summary>
        /// Get taxonomies as hierarchical tree structure
        /// </summary>
        [HttpGet("tree")]
        public async Task<IActionResult> GetTaxonomyTree()
        {
            var taxonomyTree = await _taxonomyService.GetTaxonomyTreeAsync();

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(taxonomyTree)
                .Build());
        }

        /// <summary>
        /// Get taxonomies as flat list with parent information
        /// </summary>
        [HttpGet("flat")]
        public async Task<IActionResult> GetTaxonomyFlatList()
        {
            var taxonomies = await _taxonomyService.GetTaxonomyFlatListAsync();

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(taxonomies)
                .Build());
        }

        /// <summary>
        /// Get children taxonomies by parent ID
        /// </summary>
        [HttpGet("parent/{parentId}/children")]
        public async Task<IActionResult> GetChildrenByParentId(int parentId)
        {
            var children = await _taxonomyService.GetChildrenByParentIdAsync(parentId);

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(children)
                .Build());
        }

        /// <summary>
        /// Get specific taxonomy by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetTaxonomyById(int id)
        {
            var taxonomy = await _taxonomyService.GetTaxonomyByIdAsync(id);

            if (taxonomy == null)
            {
                return NotFound(APIResponse<string>.Builder()
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .WithSuccess(false)
                    .WithResult("Taxonomy not found")
                    .Build());
            }

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(taxonomy)
                .Build());
        }

        /// <summary>
        /// Get root technologies
        /// </summary>
        [HttpGet("roots")]
        public async Task<IActionResult> GetRootTaxonomies()
        {
            var roots = await _taxonomyService.GetRootTaxonomiesAsync();

            return Ok(APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(roots)
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
                
                var response = new
                {
                    Id = taxonomy.Id,
                    Name = taxonomy.Name,
                    ParentId = taxonomy.ParentId
                };

                return Ok(APIResponse<object>.Builder()
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
                
                var response = new
                {
                    Id = taxonomy.Id,
                    Name = taxonomy.Name,
                    ParentId = taxonomy.ParentId
                };

                return Ok(APIResponse<object>.Builder()
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
