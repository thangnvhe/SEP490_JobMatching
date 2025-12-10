using AutoMapper;
using JobMatchingSystem.API.DTOs.Request;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Mappings
{
    public class MappingProfile :Profile
    {
        public MappingProfile() {
            //Company
            CreateMap<CreateCompanyRequest, Company>()
            .ForMember(dest => dest.LicenseFile, opt => opt.Ignore());
            CreateMap<Company, CompanyDTO>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt ?? DateTime.UtcNow));
            CreateMap<Company, CompanyDetailResponse>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.CreatedAt ?? DateTime.UtcNow))
                .ForMember(dest => dest.JobCount, opt => opt.Ignore())
                .ForMember(dest => dest.TeamMembersCount, opt => opt.Ignore())
                .ForMember(dest => dest.RecruitsCount, opt => opt.Ignore());
            CreateMap<UpdateCompanyRequest, Company>()
            .ForMember(dest => dest.Logo, opt => opt.Ignore());
            //CandidateJob
            CreateMap<CreateCandidateJobRequest, CandidateJob>();
            CreateMap<UpdateCandidateJobRequest, CandidateJobDTO>();
            CreateMap<CandidateJob, CandidateJobDTO>();
        }
    }
}
