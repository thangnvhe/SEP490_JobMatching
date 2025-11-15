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
    }
}
