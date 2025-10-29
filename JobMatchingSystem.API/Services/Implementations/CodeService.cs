using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class CodeService : ICodeService
    {
        protected readonly ICodeRepository _codeRepository;
        protected readonly IMapper _mapper;
        private readonly IWebHostEnvironment _env;
        public CodeService(ICodeRepository codeRepository,IMapper mapper ,IWebHostEnvironment env)
        {
            _codeRepository = codeRepository;
            _mapper = mapper;
            _env = env;
        }
        public async Task CreateCode(CreateCodeRequest request)
        {
            var code = _mapper.Map<Code>(request);
            if (request.Images != null)
            {
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(request.Images.FileName)}";
                var savePath = Path.Combine(_env.WebRootPath, "images", "CodeImages", fileName);
                Directory.CreateDirectory(Path.GetDirectoryName(savePath)!);
                using (var stream = new FileStream(savePath, FileMode.Create))
                {
                    await request.Images.CopyToAsync(stream);
                }
                code.Image = Path.Combine("images", "CodeImages", fileName).Replace("\\", "/");
            }
            
            await _codeRepository.CreateCode(code);
        }

        public async Task DeleteCode(int codeId)
        {
            var codeDelete= await _codeRepository.GetCodeById(codeId);
            if (codeDelete == null)
            {
                throw new AppException(ErrorCode.NotFoundCode());
            }
             await _codeRepository.SoftDeleteCode(codeId);

        }

        public async Task<List<CodeDTO>> GetAllCode()
        {
            var ListCode= await _codeRepository.GetAllCode();
            if (ListCode == null) {
            return new List<CodeDTO>();
            }
            var ListCodeDTO= _mapper.Map<List<CodeDTO>>(ListCode);
            return ListCodeDTO;
            
        }

        public async Task<CodeDTO> GetCodeById(int codeId)
        {
            var code= await _codeRepository.GetCodeById(codeId);
            if (code == null) {
                throw new AppException(ErrorCode.NotFoundCode());
            }
            var codeDTO= _mapper.Map<CodeDTO>(code);
            return codeDTO;
        }

        public async Task UpdateCode(int codeId,UpdateCodeRequest request)
        {
            var code= await _codeRepository.GetCodeById(codeId);
            if (code == null) {
                throw new AppException(ErrorCode.NotFoundCode());
            }
            _mapper.Map(request,code);
            if (request.Images != null)
            {
                if (!string.IsNullOrEmpty(code.Image))
                {
                    var oldFilePath = Path.Combine(_env.WebRootPath, code.Image.Replace("/", "\\"));
                    if (File.Exists(oldFilePath))
                    {
                        File.Delete(oldFilePath);
                    }
                }
                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(request.Images.FileName)}";
                var savePath = Path.Combine(_env.WebRootPath, "images", "CodeImages", fileName);
                Directory.CreateDirectory(Path.GetDirectoryName(savePath)!);
                using (var stream = new FileStream(savePath, FileMode.Create))
                {
                    await request.Images.CopyToAsync(stream);
                }
                code.Image = Path.Combine("images", "CodeImages", fileName).Replace("\\", "/");
            }
            await _codeRepository.UpdateCode(code);
        }
    }
}
