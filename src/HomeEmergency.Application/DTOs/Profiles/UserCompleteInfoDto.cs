using System;

namespace HomeEmergency.Application.DTOs.Profiles;

public class UserCompleteInfoDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool TwoFactorEnabled { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
    public int AccessFailedCount { get; set; }

    // Embedded profiles
    public CustomerProfileDto? CustomerProfile { get; set; }
    public ProviderProfileDto? ProviderProfile { get; set; }
    public CompanyProfileDto? CompanyProfile { get; set; }
}

