using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using FluentValidation;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Application.Services;

namespace HomeEmergency.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Register AutoMapper
        services.AddAutoMapper(assembly);

        // Register FluentValidation validators for MVC auto-validation.
        services.AddValidatorsFromAssembly(assembly);

        // Register Application Services
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IDocumentService, DocumentService>();
        services.AddScoped<IWarningService, WarningService>();
        services.AddScoped<ISubscriptionService, SubscriptionService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProviderOfferService, ProviderOfferService>();
        services.AddScoped<IServiceRequestService, ServiceRequestService>();
        services.AddScoped<IExaminationService, ExaminationService>();
        services.AddScoped<IServiceExecutionService, ServiceExecutionService>();
        services.AddScoped<ITrackingLocationService, TrackingLocationService>();

        return services;
    }
}

