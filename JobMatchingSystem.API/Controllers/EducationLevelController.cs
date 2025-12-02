using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EducationLevelController : ControllerBase
    {
        private readonly IEducationLevelService _educationLevelService;

        public EducationLevelController(IEducationLevelService educationLevelService)
        {
            _educationLevelService = educationLevelService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var educationLevels = await _educationLevelService.GetAllAsync();
            return Ok(APIResponse<List<EducationLevelDto>>.Builder()
                .WithResult(educationLevels)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var educationLevel = await _educationLevelService.GetByIdAsync(id);
            return Ok(APIResponse<EducationLevelDto>.Builder()
                .WithResult(educationLevel)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
    }
}