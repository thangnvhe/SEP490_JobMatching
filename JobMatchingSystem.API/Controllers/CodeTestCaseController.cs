using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
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
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _codeTestService.GetAllCodeTestCase();
            return Ok(APIResponse<List<CodeTestCaseDTO>>.Builder()
              .WithResult(list)
              .WithSuccess(true)
              .WithStatusCode(HttpStatusCode.OK)
              .Build());
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var codeTest = await _codeTestService.GetCodeTestCaseById(id);
            if (codeTest == null)
            {
                return NotFound(APIResponse<string>.Builder()
                    .WithResult("Code Test Case Not Found")
                    .WithSuccess(false)
                    .WithStatusCode(HttpStatusCode.NotFound)
                    .Build());
            }

            return Ok(APIResponse<CodeTestCaseDTO>.Builder()
              .WithResult(codeTest)
              .WithSuccess(true)
              .WithStatusCode(HttpStatusCode.OK)
              .Build());
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateCodeTestCaseRequest request)
        {
            await _codeTestService.UpdateCodeTestCase(id, request);
            return Ok(APIResponse<string>.Builder()
              .WithResult("Update Code Test Case Success")
              .WithSuccess(true)
              .WithStatusCode(HttpStatusCode.OK)
              .Build());
        }
        [HttpGet("bycode/{codeId:int}")]
        public async Task<IActionResult> GetAllByCodeId(int codeId)
        {
            var list = await _codeTestService.GetAllCodeTestCaseByCodeId(codeId);

            return Ok(APIResponse<List<CodeTestCaseDTO>>.Builder()
                .WithResult(list)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _codeTestService.DeleteCodeTestCase(id);

            return Ok(APIResponse<string>.Builder()
                .WithResult("Delete Code Test Case Success")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }



    }
}
