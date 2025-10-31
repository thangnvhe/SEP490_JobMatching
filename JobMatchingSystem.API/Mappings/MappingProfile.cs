using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Entities;
using Microsoft.AspNetCore.Identity;
namespace JobMatchingSystem.API.Mappings
{
    public class MappingProfile :Profile
    {
        public MappingProfile()
        {
            //User
            CreateMap<ApplicationUser, UserResponseDTO>();
            //Company
            CreateMap<Company,CompanyDTO>();
            //Code
            CreateMap<CreateCodeRequest, Code>();
            CreateMap<Code,CodeDTO>();
            CreateMap<UpdateCodeRequest, Code>();
            //CodeTestCase
            CreateMap<CreateCodeTestCaseRequest, CodeTestCase>();
            CreateMap<UpdateCodeTestCaseRequest, CodeTestCase>();
            CreateMap<CodeTestCase, CodeTestCaseDTO>();
                
        }
    }
}
