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

        [HttpGet("paged")]
        public async Task<IActionResult> GetAllPaged([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string sortBy = "", [FromQuery] bool isDescending = false, [FromQuery] string search = "")
        {
            var pagedResult = await _positionService.GetAllPagedAsync(page, pageSize, sortBy, isDescending, search);

            return Ok(APIResponse<PagedResult<PositionResponse>>.Builder()
                .WithStatusCode(HttpStatusCode.OK)
                .WithSuccess(true)
                .WithResult(pagedResult)
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

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create([FromBody] CreatePositionRequest request)
        {
            try
            {
                var position = await _positionService.CreatePositionAsync(request);
                
                var response = new PositionResponse
                {
                    PositionId = position.PositionId,
                    Name = position.Name
                };

                return Ok(APIResponse<PositionResponse>.Builder()
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
        public async Task<IActionResult> Update(int id, [FromBody] UpdatePositionRequest request)
        {
            try
            {
                var position = await _positionService.UpdatePositionAsync(id, request);
                
                var response = new PositionResponse
                {
                    PositionId = position.PositionId,
                    Name = position.Name
                };

                return Ok(APIResponse<PositionResponse>.Builder()
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _positionService.DeletePositionAsync(id);

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
