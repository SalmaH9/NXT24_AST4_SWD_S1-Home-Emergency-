using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;
using HomeEmergency.Infrastructure.Options;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace HomeEmergency.Infrastructure.Services;

public class DevelopmentAdminSeeder : IHostedService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IWebHostEnvironment _environment;
    private readonly IOptions<SeedAdminOptions> _options;
    private readonly ILogger<DevelopmentAdminSeeder> _logger;

    public DevelopmentAdminSeeder(
        IServiceProvider serviceProvider,
        IWebHostEnvironment environment,
        IOptions<SeedAdminOptions> options,
        ILogger<DevelopmentAdminSeeder> logger)
    {
        _serviceProvider = serviceProvider;
        _environment = environment;
        _options = options;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var options = _options.Value;
        if (!_environment.IsDevelopment() || !options.Enabled)
        {
            return;
        }

        if (string.IsNullOrWhiteSpace(options.Email) ||
            string.IsNullOrWhiteSpace(options.Password) ||
            string.IsNullOrWhiteSpace(options.FullName))
        {
            _logger.LogWarning("SeedAdmin is enabled but required configuration values are missing.");
            return;
        }

        using var scope = _serviceProvider.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        if (!await roleManager.RoleExistsAsync("Admin"))
        {
            var roleResult = await roleManager.CreateAsync(new IdentityRole<Guid>("Admin"));
            if (!roleResult.Succeeded)
            {
                _logger.LogError("Failed to create Admin role for development bootstrap: {Errors}",
                    string.Join(" ", roleResult.Errors.Select(x => x.Description)));
                return;
            }
        }

        var existingUser = await userManager.FindByEmailAsync(options.Email);
        if (existingUser == null)
        {
            existingUser = new ApplicationUser
            {
                UserName = options.Email,
                Email = options.Email,
                FullName = options.FullName,
                Status = AccountStatus.Active,
                CreatedAt = DateTime.UtcNow
            };

            var createResult = await userManager.CreateAsync(existingUser, options.Password);
            if (!createResult.Succeeded)
            {
                _logger.LogError("Failed to create development admin user: {Errors}",
                    string.Join(" ", createResult.Errors.Select(x => x.Description)));
                return;
            }
        }

        if (!await userManager.IsInRoleAsync(existingUser, "Admin"))
        {
            var addRoleResult = await userManager.AddToRoleAsync(existingUser, "Admin");
            if (!addRoleResult.Succeeded)
            {
                _logger.LogError("Failed to assign Admin role to development admin user: {Errors}",
                    string.Join(" ", addRoleResult.Errors.Select(x => x.Description)));
            }
        }
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
