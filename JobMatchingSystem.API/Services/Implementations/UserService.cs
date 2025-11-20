using AutoMapper;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Repositories.Implementations;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using System.Data;
using System.Security.Claims;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class UserService : IUserService
    {
        protected readonly IUnitOfWork _unitOfWork;
        protected readonly IMapper _mapper;
        public UserService(IUnitOfWork unitOfWork,IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper=mapper;
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

        public async Task<PagedResult<UserResponseDTO>> GetAllUser(int page = 1, int size = 5, string search = "", string sortBy = "", bool isDecending = false)
        {
            var listUser = await _unitOfWork.AuthRepository.GetAllAsync( search,sortBy, isDecending);
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
            var userDtos=_mapper.Map<List<UserResponseDTO>>(users);
            return new PagedResult<UserResponseDTO>
            {
                Items = userDtos,
                pageInfo = new PageInfo(listUser.Count, page, size, sortBy, isDecending)
            };
        }

        public async Task<UserResponseDTO> GetUserById(int userId)
        {
            var user = await _unitOfWork.AuthRepository.GetUserById(userId);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }
            var userDTO = _mapper.Map<UserResponseDTO>(user);
            return userDTO;
        }

        public async Task<CurrentUserResponseDTO> GetCurrentUser(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            // Convert string userId to int since the repository expects int
            if (!int.TryParse(userId, out int userIdInt))
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            var user = await _unitOfWork.AuthRepository.GetUserById(userIdInt);
            if (user == null)
            {
                throw new AppException(ErrorCode.NotFoundUser());
            }

            // Get user roles
            var roles = await _unitOfWork.AuthRepository.GetRolesAsync(user);

            var currentUserDTO = new CurrentUserResponseDTO
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                PhoneNumber = user.PhoneNumber ?? string.Empty,
                Address = user.Address,
                AvatarUrl = user.AvatarUrl,
                Gender = user.Gender,
                Birthday = user.Birthday,
                IsActive = user.IsActive,
                Score = user.Score,
                CompanyId = user.CompanyId,
                Role = roles.FirstOrDefault() // Lấy role đầu tiên vì mỗi user chỉ có 1 role
            };

            return currentUserDTO;
        }
    }
}
