using AutoMapper;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Application.DTOs.Profiles;
using HomeEmergency.Application.DTOs.Verification;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.DTOs.Warnings;
using HomeEmergency.Application.DTOs.Subscriptions;

namespace HomeEmergency.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<CustomerProfile, CustomerProfileDto>().ReverseMap();
        CreateMap<ProviderProfile, ProviderProfileDto>().ReverseMap();
        CreateMap<CompanyProfile, CompanyProfileDto>().ReverseMap();

        CreateMap<VerificationDocument, DocumentDto>()
            .ForMember(dest => dest.DocumentType, opt => opt.MapFrom(src => src.DocumentType.ToString()))
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<ApplicationUser, UserProfileDto>()
            .ForMember(dest => dest.Role, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<ApplicationUser, UserCompleteInfoDto>()
            .ForMember(dest => dest.Role, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<ApplicationUser, AdminUserSummaryDto>()
            .ForMember(dest => dest.Role, opt => opt.Ignore())
            .ForMember(dest => dest.IsVerified, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<ApplicationUser, AdminUserDetailDto>()
            .ForMember(dest => dest.Role, opt => opt.Ignore())
            .ForMember(dest => dest.IsVerified, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
            .ForMember(dest => dest.VerificationDocuments, opt => opt.MapFrom(src => src.SubmittedDocuments));

        CreateMap<UserWarning, WarningDto>();

        CreateMap<SubscriptionPlan, SubscriptionPlanDto>().ReverseMap();
        CreateMap<CreateSubscriptionPlanDto, SubscriptionPlan>();
        CreateMap<UpdateSubscriptionPlanDto, SubscriptionPlan>();

        CreateMap<Subscription, UserSubscriptionDto>()
            .ForMember(dest => dest.PlanName, opt => opt.MapFrom(src => src.SubscriptionPlan != null ? src.SubscriptionPlan.Name : string.Empty));
    }
}

