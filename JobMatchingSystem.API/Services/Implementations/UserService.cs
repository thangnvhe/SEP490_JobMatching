using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class UserService : IUserService
    {
        protected readonly IAuthRepository _authRepository;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;
        public UserService(IAuthRepository authRepository,IMapper mapper,UserManager<ApplicationUser> userManager,IEmailService emailService)
        {
            _authRepository = authRepository;
            _mapper = mapper;
            _userManager = userManager;
            _emailService = emailService;
            
        }

        public async Task<PagedResult<UserResponseDTO>> GetAllUser(int page = 1, int size = 5,string search="",int role=0)
        {
            var listUser = await _authRepository.GetAllAsync(search,role);
            if (listUser == null || !listUser.Any())
            {
                return new PagedResult<UserResponseDTO>
                {
                    Items = new List<UserResponseDTO>(),
                    Pager = new Pager(0, page, size)
                };
            }


            int totalItems = listUser.Count;
            int skip = (page - 1) * size;

            var pagedUsers = listUser.Skip(skip).Take(size).ToList();
            var userDtos = _mapper.Map<List<UserResponseDTO>>(pagedUsers);

            for (int i = 0; i < pagedUsers.Count; i++)
            {
                var roles = await _userManager.GetRolesAsync(pagedUsers[i]);
                userDtos[i].Role = roles.FirstOrDefault() ?? "NoRole";
            }

            return new PagedResult<UserResponseDTO>
            {
                Items = userDtos,
                Pager = new Pager(totalItems, page, size)
            };
        }

        public async Task<UserResponseDTO> GetUserById(int userId)
        {
            var user= await _authRepository.GetUserById(userId);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }
            var userDTO=_mapper.Map<UserResponseDTO>(user);
            var roles = await _userManager.GetRolesAsync(user);
            userDTO.Role = roles.FirstOrDefault() ?? "NoRole";
            return userDTO;
        }
        public async Task CreateUserByAdminAsync(CreateUserByAdminRequest request)
        {

            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
                throw new AppException(ErrorCode.EmailExist());


            var password = PasswordHelper.GenerateRandomPassword();



            var user = new ApplicationUser
            {
                FullName = request.FullName,
                Email = request.Email,
                UserName = request.Email,
                PhoneNumber = request.PhoneNumber,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
                throw new AppException(ErrorCode.InvalidCreate());
            await _userManager.AddToRoleAsync(user, request.Role);

            
            var body = $@"
                <h3>Xin chào {request.FullName},</h3>
                <p>Tài khoản của bạn đã được tạo thành công.</p>
                <p><b>Email đăng nhập:</b> {request.Email}</p>
                <p><b>Mật khẩu tạm thời:</b> {password}</p>
                <p>Vui lòng đăng nhập và đổi mật khẩu sớm nhất có thể.</p>
            ";
            await _emailService.SendEmailAsync(request.Email, "Tài khoản mới của bạn", body);
        }

        public async Task ChangeStatus(int userId)
        {
            var user= await _authRepository.GetUserById(userId);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }
            await _authRepository.ChangeStatus(user);

        }
    }
}
