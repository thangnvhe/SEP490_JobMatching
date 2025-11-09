using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Services.Interfaces;
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

        [HttpGet("skills")]
        public async Task<IActionResult> GetAllSkills()
        {
            var skills = await _taxonomyService.GetAllSkillsAsync();
            return Ok(new
            {
                StatusCode = (int)HttpStatusCode.OK,
                Success = true,
                Count = skills.Count(),
                Result = skills
            });
        }

        [HttpGet("skills/{id}")]
        public async Task<IActionResult> GetSkillById(int id)
        {
            try
            {
                var skill = await _taxonomyService.GetSkillByIdAsync(id);
                return Ok(new
                {
                    StatusCode = (int)HttpStatusCode.OK,
                    Success = true,
                    Result = skill
                });
            }
            catch (AppException ex)
            {
                return NotFound(new
                {
                    StatusCode = (int)HttpStatusCode.NotFound,
                    Success = false,
                    Message = ex.Message
                });
            }
        }
    }
}
