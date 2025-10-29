using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.CodeAnalysis.CSharp.Syntax;
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

        public async Task DeleteCodeTestCase(int codeId)
        {
            var codeTestCaseDelete = await _codeTestRepository.GetTestCaseById(codeId);
            if (codeTestCaseDelete == null)
            {
                throw new AppException(ErrorCode.CodeTestCaseNotFound());
            }
            await _codeTestRepository.DeleteCodeTest(codeTestCaseDelete);
        }

        public async Task<List<CodeTestCaseDTO>> GetAllCodeTestCase()
        {
            var ListTestCode= await _codeTestRepository.GetAllCodeTestCases();
            if (ListTestCode == null)
            {
                return new List<CodeTestCaseDTO>();
            }
            var ListTestCodeDTO=_mapper.Map<List<CodeTestCaseDTO>>(ListTestCode);
            return ListTestCodeDTO;
        }

        public async Task<List<CodeTestCaseDTO>> GetAllCodeTestCaseByCodeId(int codeId)
        {
            var ListTestCode = await _codeTestRepository.GetAllTestCaseByCodeID(codeId);
            if(ListTestCode == null)
            {
                return new List<CodeTestCaseDTO>();
            }
            var ListTestCodeDTO = _mapper.Map<List<CodeTestCaseDTO>>(ListTestCode);
            return ListTestCodeDTO;
        }

        public async Task<CodeTestCaseDTO> GetCodeTestCaseById(int codeId)
        {
            var TestCode=await _codeTestRepository.GetTestCaseById(codeId);
            var TestCodeDTO=_mapper.Map<CodeTestCaseDTO>(TestCode);
            return TestCodeDTO;
        }

        public async Task UpdateCodeTestCase(int codeId, UpdateCodeTestCaseRequest code)
        {
            var CodeTest=await _codeTestRepository.GetTestCaseById(codeId);
            if (CodeTest == null)
            {
                throw new AppException(ErrorCode.CodeTestCaseNotFound());
            }
            _mapper.Map(code,CodeTest);
            await _codeTestRepository.UpdateCodeTest(CodeTest);
        }
    }
}
