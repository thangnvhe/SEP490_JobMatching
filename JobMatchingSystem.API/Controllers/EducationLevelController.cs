using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
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

        [HttpGet("paged")]
        public async Task<IActionResult> GetAllPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string sortBy = "", [FromQuery] bool isDescending = false, [FromQuery] string search = "")
        {
            var pagedResult = await _educationLevelService.GetAllPagedAsync(page, pageSize, sortBy, isDescending, search);

            return Ok(APIResponse<PagedResult<EducationLevelDto>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(pagedResult)
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

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreateEducationLevelRequest request)
        {
            try
            {
                var educationLevel = await _educationLevelService.CreateAsync(request);
                
                var response = new EducationLevelDto
                {
                    Id = educationLevel.Id,
                    LevelName = educationLevel.LevelName,
                    RankScore = educationLevel.RankScore,
                    IsActive = educationLevel.IsActive
                };

                return Ok(APIResponse<EducationLevelDto>.Builder()
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

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateEducationLevelRequest request)
        {
            try
            {
                var educationLevel = await _educationLevelService.UpdateAsync(id, request);
                
                var response = new EducationLevelDto
                {
                    Id = educationLevel.Id,
                    LevelName = educationLevel.LevelName,
                    RankScore = educationLevel.RankScore,
                    IsActive = educationLevel.IsActive
                };

                return Ok(APIResponse<EducationLevelDto>.Builder()
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
    }
}