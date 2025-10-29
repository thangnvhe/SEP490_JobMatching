using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Services.Implementations;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CodeTestCaseController : ControllerBase
    {
        private readonly ICodeTestService _codeTestService;

        public CodeTestCaseController(ICodeTestService codeTestService)
        {
            _codeTestService = codeTestService;
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateCodeTestCaseRequest request)
        {
            await _codeTestService.CreateCodeTest(request);
            return Ok(APIResponse<string>.Builder()
              .WithResult("Create Code Test Case Success")
              .WithSuccess(true)
              .WithStatusCode(HttpStatusCode.OK)
              .Build());
        }

    }
}
