using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Infrastructure.Persistence;
using HomeEmergency.Infrastructure.Persistence.Repositories;
using HomeEmergency.Infrastructure.Options;
using HomeEmergency.Infrastructure.Services;
using Microsoft.Extensions.Options;

namespace HomeEmergency.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));
        services.Configure<SeedAdminOptions>(configuration.GetSection(SeedAdminOptions.SectionName));
        services.AddHttpContextAccessor();

        // 1. Configure EF Core DbContext with SQL Server
        var connectionString = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString, b => 
                b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        // 2. Configure ASP.NET Core Identity
        services.AddIdentity<ApplicationUser, IdentityRole<Guid>>(options =>
        {
            // Simple Password Rules for Graduation Project
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequiredLength = 6;

            // Lockout settings
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;

            // User settings
            options.User.RequireUniqueEmail = true;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        // 3. Register Repositories and Unit of Work
        services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // 4. Register Services
        services.AddScoped<IFileStorageService, LocalFileStorageService>();
        services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
        services.AddScoped<IAdminUserService, AdminUserService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IChatService, ChatService>();
        services.AddScoped<IRatingService, RatingService>();
        services.AddScoped<IAdvertisementService, AdvertisementService>();
        services.AddScoped<IAIConversationService, AIConversationService>();
        services.AddScoped<IAdminDashboardService, AdminDashboardService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();
        services.AddHostedService<DevelopmentAdminSeeder>();

        return services;
    }
}

