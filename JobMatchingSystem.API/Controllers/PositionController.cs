using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PositionController : ControllerBase
    {
        private readonly IPositionService _positionService;

        public PositionController(IPositionService positionService)
        {
            _positionService = positionService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var positions = await _positionService.GetAllAsync();

            return Ok(APIResponse<IEnumerable<PositionResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(positions)
                .Build());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var position = await _positionService.GetByIdAsync(id);

            return Ok(APIResponse<PositionResponse>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(position)
                .Build());
        }
    }
}
