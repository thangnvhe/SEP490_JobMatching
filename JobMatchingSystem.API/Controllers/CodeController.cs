using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.CSharp;
using Microsoft.CodeAnalysis;
using Newtonsoft.Json.Linq;
using System.Net;
using System.Reflection;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;
using JobMatchingSystem.API.Data;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CodeController : ControllerBase
    {
        private readonly ICodeService _codeService;
        private readonly ApplicationDbContext _context;

        public CodeController(ICodeService codeService, ApplicationDbContext context)
        {
            _codeService = codeService;
            _context = context;
        }
        [HttpPost]
        public async Task<IActionResult> CreateCode([FromForm] CreateCodeRequest request)
        {
            await _codeService.CreateCode(request);
            return Ok(APIResponse<string>.Builder()
                .WithResult("Create Code Success")
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.Created)
                .Build());
        }
        [HttpGet]
        public async Task<IActionResult> GetAllCode()
        {
            var result = await _codeService.GetAllCode();
            return Ok(APIResponse<List<CodeDTO>>.Builder()
                .WithResult(result)
                .WithSuccess(true)
                .WithStatusCode(HttpStatusCode.OK)
                .Build());
        }
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCodeById(int id)
        {
            var result = await _codeService.GetCodeById(id);
            return Ok(APIResponse<CodeDTO>.Builder()
           .WithResult(result)
           .WithSuccess(true)
           .WithStatusCode(HttpStatusCode.OK)
           .Build());
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCode(int id, [FromForm] UpdateCodeRequest request)
        {
            await _codeService.UpdateCode(id, request);

            return Ok(APIResponse<string>.Builder()
            .WithResult("Update Code Success")
            .WithSuccess(true)
            .WithStatusCode(HttpStatusCode.OK)
            .Build());
        }
        [HttpDelete("{codeId}")]
        public async Task<IActionResult> DeleteCode(int codeId)
        {
            await _codeService.DeleteCode(codeId);
            return Ok(APIResponse<string>.Builder()
              .WithResult("Delete Code Success")
              .WithSuccess(true)
              .WithStatusCode(HttpStatusCode.OK)
              .Build());
        }
        [HttpPost("judge/{codeId}")]
        public IActionResult JudgeCode(int codeId, [FromBody] CodeRequest request)
        {
            // 1️⃣ Lấy code từ DB kèm test cases
            var code = _context.Codes
                .Where(c => c.Id == codeId)
                .Select(c => new
                {
                    c.Id,
                    c.Title,
                    c.ParameterTypes,
                    c.ReturnType,
                    TestCases = c.CodeTestCases.Select(tc => new { tc.InputData, tc.ExpectedData }).ToList()
                })
                .FirstOrDefault();

            if (code == null) return NotFound("Code not found");
            if (code.TestCases == null || !code.TestCases.Any())
                return NotFound("No testcases");

            // 2️⃣ Regex lấy tên hàm
            var match = Regex.Match(request.Code, @"public\s+static\s+\w+\s+(\w+)\s*\(");
            if (!match.Success) return BadRequest("Cannot detect function name");
            string functionName = match.Groups[1].Value;

            // 3️⃣ Compile code bằng Roslyn
            string userCode = $@"
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Diagnostics;
public static class UserCodeClass
{{
    {request.Code}
}}";

            var syntaxTree = CSharpSyntaxTree.ParseText(userCode);
            var references = new[]
            {
        MetadataReference.CreateFromFile(typeof(object).Assembly.Location),
        MetadataReference.CreateFromFile(typeof(Enumerable).Assembly.Location),
        MetadataReference.CreateFromFile(typeof(List<>).Assembly.Location),
        MetadataReference.CreateFromFile(typeof(Math).Assembly.Location),
        MetadataReference.CreateFromFile(typeof(System.Text.RegularExpressions.Regex).Assembly.Location),
        MetadataReference.CreateFromFile(typeof(System.Net.Http.HttpClient).Assembly.Location)
    };
            var compilation = CSharpCompilation.Create(
                "UserAssembly",
                new[] { syntaxTree },
                references,
                new CSharpCompilationOptions(OutputKind.DynamicallyLinkedLibrary)
            );

            using var ms = new MemoryStream();
            var result = compilation.Emit(ms);
            if (!result.Success)
            {
                var errors = string.Join("\n", result.Diagnostics
                    .Where(d => d.Severity == DiagnosticSeverity.Error)
                    .Select(d => d.ToString()));
                return BadRequest(new { compileError = errors });
            }

            ms.Seek(0, SeekOrigin.Begin);
            var assembly = Assembly.Load(ms.ToArray());
            var type = assembly.GetType("UserCodeClass");
            var method = type.GetMethod(functionName, BindingFlags.Public | BindingFlags.Static);
            if (method == null) return BadRequest("Method not found");

            // 4️⃣ Duyệt tất cả testcase
            int passedCount = 0;
            var details = new List<object>();

            var paramTypes = code.ParameterTypes.Split(','); // ["int","int"]

            foreach (var tc in code.TestCases)
            {
                var inputValues = JArray.Parse(tc.InputData);
                object[] inputs = new object[paramTypes.Length];
                for (int i = 0; i < paramTypes.Length; i++)
                {
                    inputs[i] = ConvertToType(inputValues[i], paramTypes[i]);
                }

                object output;
                try
                {
                    output = method.Invoke(null, inputs);
                }
                catch (Exception ex)
                {
                    output = $"Runtime Error: {ex.InnerException?.Message ?? ex.Message}";
                }

                bool passed = CompareOutput(output, tc.ExpectedData, code.ReturnType);
                if (passed) passedCount++;

                details.Add(new
                {
                    input = tc.InputData,
                    expected = tc.ExpectedData,
                    output,
                    passed
                });
            }

            double rate = (double)passedCount / code.TestCases.Count * 100;
            return Ok(new
            {
                passedCount,
                totalCount = code.TestCases.Count,
                rate,
                details
            });
        }

        // Convert JToken -> type
        private object ConvertToType(JToken token, string typeName)
        {
            return typeName switch
            {
                "int" => token.ToObject<int>(),
                "double" => token.ToObject<double>(),
                "string" => token.ToObject<string>(),
                "bool" => token.ToObject<bool>(),
                "int[]" => token.Select(t => t.ToObject<int>()).ToArray(),
                "double[]" => token.Select(t => t.ToObject<double>()).ToArray(),
                "string[]" => token.Select(t => t.ToObject<string>()).ToArray(),
                "bool[]" => token.Select(t => t.ToObject<bool>()).ToArray(),
                _ => token.ToObject<object>()
            };
        }

        // Compare output với expected string
        private bool CompareOutput(object actual, string expectedString, string returnType)
        {
            try
            {
                // Thêm kiểm tra null và Runtime Error để an toàn hơn
                if (actual == null) return expectedString == "null";
                if (actual is string s && s.StartsWith("Runtime Error")) return false;

                // Xử lý mảng (Giữ nguyên logic sửa lỗi CS0305 và đệ quy)
                if (returnType.EndsWith("[]"))
                {
                    // Logic mảng đã được sửa ở lần trước
                    var expectedArray = JArray.Parse(expectedString);
                    if (actual is not System.Collections.IEnumerable e) return false;

                    // Lấy loại phần tử (vd: "int" từ "int[]")
                    string elementType = returnType.Replace("[]", "");

                    var actualList = e.Cast<object>().ToList();
                    if (actualList.Count != expectedArray.Count) return false;

                    for (int i = 0; i < actualList.Count; i++)
                    {
                        // Sử dụng đệ quy để so sánh từng phần tử
                        if (!CompareOutput(actualList[i], expectedArray[i].ToString(), elementType))
                        {
                            return false;
                        }
                    }
                    return true;
                }
                else // Xử lý giá trị đơn
                {
                    return returnType switch
                    {
                        // SỬA: Thay (int)actual bằng Convert.ToInt32(actual)
                        "int" => Convert.ToInt32(actual) == int.Parse(expectedString),

                        // SỬA: Thay (double)actual bằng Convert.ToDouble(actual)
                        "double" => Math.Abs(Convert.ToDouble(actual) - double.Parse(expectedString)) < 1e-6,

                        // SỬA: Thay (string)actual bằng actual.ToString() hoặc so sánh an toàn hơn
                        "string" => actual.ToString() == expectedString,

                        // SỬA: Thay (bool)actual bằng Convert.ToBoolean(actual)
                        "bool" => Convert.ToBoolean(actual) == bool.Parse(expectedString),

                        _ => actual.ToString() == expectedString
                    };
                }
            }
            catch
            {
                return false;
            }
        }
    }
}