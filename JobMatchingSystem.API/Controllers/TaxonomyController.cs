using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Services.Interfaces;
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
    }
}
