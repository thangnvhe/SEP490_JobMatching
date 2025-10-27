using AutoMapper;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using Microsoft.AspNetCore.Identity;
namespace JobMatchingSystem.API.Mappings
{
    public class MappingProfile :Profile
    {
        public MappingProfile()
        {
            CreateMap<ApplicationUser, UserResponseDTO>();
                
        }
    }
}
