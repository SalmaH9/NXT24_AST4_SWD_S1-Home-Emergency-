using AutoMapper;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.DTOs.Categories;
using HomeEmergency.Application.DTOs.Profiles;
using HomeEmergency.Application.DTOs.Subscriptions;
using HomeEmergency.Application.DTOs.Verification;
using HomeEmergency.Application.DTOs.Warnings;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Application.DTOs.ServiceRequests;
using HomeEmergency.Application.DTOs.ProviderOffers;
using HomeEmergency.Application.DTOs.Examinations;
using HomeEmergency.Application.DTOs.ServiceExecutions;
using HomeEmergency.Application.DTOs.TrackingLocations;

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

        CreateMap<Category, CategoryDto>().ReverseMap();
        CreateMap<CreateCategoryDto, Category>();
        CreateMap<UpdateCategoryDto, Category>();
        CreateMap<Category, CategoryDto>();

        CreateMap<ServiceRequest, ServiceRequestDto>()
         .ForMember(dest => dest.Status,
            opt => opt.MapFrom(src => src.Status.ToString()));

        CreateMap<CreateServiceRequestDto, ServiceRequest>();

        CreateMap<UpdateServiceRequestDto, ServiceRequest>();

        CreateMap<ProviderOffer, ProviderOfferDto>();

        CreateMap<CreateProviderOfferDto, ProviderOffer>();

        CreateMap<Examination, ExaminationDto>();

        CreateMap<CreateExaminationDto, Examination>();

        CreateMap<ApproveExaminationDto, Examination>();

        CreateMap<ServiceExecution, ServiceExecutionDto>();

        CreateMap<StartServiceExecutionDto, ServiceExecution>();

        CreateMap<TrackingLocation, TrackingLocationDto>();

        CreateMap<AddTrackingLocationDto, TrackingLocation>();
    }
}
