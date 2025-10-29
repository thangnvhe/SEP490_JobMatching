using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Newtonsoft.Json;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CodeTestService : ICodeTestService
    {
        protected readonly ICodeTestRepository _codeTestRepository;
        protected readonly IMapper _mapper;
        public CodeTestService(ICodeTestRepository codeTestRepository,IMapper mapper) {
            _codeTestRepository = codeTestRepository;
            _mapper = mapper;
        }
        public async Task CreateCodeTest(CreateCodeTestCaseRequest request)
        {           
            var CodeTestCase=_mapper.Map<CodeTestCase>(request);
            await _codeTestRepository.CreateCodeTest(CodeTestCase);
        }
    }
}
