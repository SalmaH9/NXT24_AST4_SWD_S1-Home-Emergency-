using System;
using System.Collections.Generic;
using HomeEmergency.Application.DTOs.Profiles;
using HomeEmergency.Application.DTOs.Verification;

namespace HomeEmergency.Application.DTOs.Admin;

public class AdminUserDetailDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public string Role { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public bool IsVerified { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Security Details
    public bool TwoFactorEnabled { get; set; }
    public bool EmailConfirmed { get; set; }
    public bool PhoneNumberConfirmed { get; set; }
    public int AccessFailedCount { get; set; }
    public DateTimeOffset? LockoutEnd { get; set; }

    // Sub-Profiles (populated based on Role)
    public CustomerProfileDto? CustomerProfile { get; set; }
    public ProviderProfileDto? ProviderProfile { get; set; }
    public CompanyProfileDto? CompanyProfile { get; set; }

    // Verification Documents list
    public List<DocumentDto> VerificationDocuments { get; set; } = new List<DocumentDto>();
}

