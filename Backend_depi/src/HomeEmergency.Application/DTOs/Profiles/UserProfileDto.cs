using System;

namespace HomeEmergency.Application.DTOs.Profiles;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;

    // Embedded profiles (populated based on role)
    public CustomerProfileDto? CustomerProfile { get; set; }
    public ProviderProfileDto? ProviderProfile { get; set; }
    public CompanyProfileDto? CompanyProfile { get; set; }
}

