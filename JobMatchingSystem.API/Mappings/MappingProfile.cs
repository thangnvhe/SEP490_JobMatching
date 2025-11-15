using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Mappings
{
    public class MappingProfile :Profile
    {
        public MappingProfile() {
            //User
            CreateMap<ApplicationUser, UserResponseDTO>();
            //Company
            CreateMap<CreateCompanyRequest, Company>()
            .ForMember(dest => dest.LicenseFile, opt => opt.Ignore());
            CreateMap<Company,CompanyDTO>();
            CreateMap<UpdateCompanyRequest, Company>()
            .ForMember(dest => dest.Logo, opt => opt.Ignore());
        }
    }
}
