using AutoMapper;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Mappings
{
    public class MappingProfile :Profile
    {
        public MappingProfile() {
            //User
            CreateMap<ApplicationUser, UserResponseDTO>();
        }
    }
}
