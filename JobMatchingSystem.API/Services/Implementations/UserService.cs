using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Implementations;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Data;
using System.Web;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class UserService : IUserService
    {
        protected readonly IUnitOfWork _unitOfWork;
        protected readonly IMapper _mapper;
        protected readonly IAuthRepository _authRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;
        public UserService(IUnitOfWork unitOfWork,IMapper mapper, IAuthRepository authRepository, UserManager<ApplicationUser> userManager, IEmailService emailService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _authRepository = authRepository;
            _userManager = userManager;
            _emailService = emailService;
        }
        public async Task ChangeStatus(int userId)
        {
            var user = await _unitOfWork.AuthRepository.GetUserById(userId);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }
            await _unitOfWork.AuthRepository.ChangeStatus(user);
            await _unitOfWork.SaveAsync();
        }

        public async Task CreateHm(CreateHmRequest request,int userid)
        {
            if (await _authRepository.ExistsAsync(request.Email))
            {
                throw new AppException(ErrorCode.EmailExist());
            }
            var userLogin= await _authRepository.GetUserById(userid);
            var user = new ApplicationUser
            {
                FullName = request.FullName,
                Email = request.Email,
                UserName = request.Email,
                EmailConfirmed = true,
                CompanyId=userLogin.CompanyId
            };
            var Password = Untity.Generate(12);
            var result = await _userManager.CreateAsync(user, Password);
            if (!result.Succeeded)
            {
                throw new AppException(ErrorCode.InvalidCreate());
            }
            await _userManager.AddToRoleAsync(user, Contraints.RoleHiringManager);
            await _emailService.SendHmPasswordEmailAsync(user.Email, user.FullName, Password);
        }

        
        public async Task<PagedResult<UserResponseDTO>> GetAllUser(int page = 1, int size = 5, string search = "", string sortBy = "", bool isDecending = false)
        {
            var listUser = await _unitOfWork.AuthRepository.GetAllWithRolesAsync( search,sortBy, isDecending);
            if (listUser == null || !listUser.Any())
            {
                return new PagedResult<UserResponseDTO>
                {
                    Items = new List<UserResponseDTO>(),
                    pageInfo = new PageInfo(0, page, size, sortBy, isDecending)
                };
            }
            var users =  listUser
           .Skip((page - 1) * size)
           .Take(size)
           .ToList();
            var userDtos = users.Select(x => new UserResponseDTO
            {
                Id = x.User.Id,
                FullName = x.User.FullName,
                Email = x.User.Email,
                Gender = x.User.Gender,
                Birthday = x.User.Birthday,
                IsActive = x.User.IsActive,
                Score = x.User.Score,
                Role = x.RoleName
            }).ToList();
            return new PagedResult<UserResponseDTO>
            {
                Items = userDtos,
                pageInfo = new PageInfo(listUser.Count, page, size, sortBy, isDecending)
            };
        }



        public async Task<List<UserResponseDTO>> GetListHmByCompanyId(int userId)
        {
            var userLogin= await _authRepository.GetUserById(userId);
            if(userLogin == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }
            var companyId = userLogin.CompanyId;
            return await _unitOfWork.AuthRepository.GetListHmByCompanyId(companyId.Value);
        }

        public async Task<UserResponseDTO> GetUserById(int userId)
        {
            var userWithRole = await _unitOfWork.AuthRepository.GetUserWithRoleByIdAsync(userId);

            if (userWithRole == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            // 2. Map thủ công sang DTO
            var userDTO = new UserResponseDTO
            {
                Id = userWithRole.User.Id,
                FullName = userWithRole.User.FullName,
                Email = userWithRole.User.Email,
                Gender = userWithRole.User.Gender,
                Birthday = userWithRole.User.Birthday,
                IsActive = userWithRole.User.IsActive,
                Score = userWithRole.User.Score,
                Role = userWithRole.RoleName
            };

            return userDTO;
        }
    }
}
