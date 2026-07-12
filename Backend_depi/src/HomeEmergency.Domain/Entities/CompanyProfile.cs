using System;

namespace HomeEmergency.Domain.Entities;

public class CompanyProfile
{
    public Guid UserId { get; set; }
    public string CompanyName { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public string? Bio { get; set; }
    public int EmployeeCount { get; set; } = 1;
    public string? CompanyLogoUrl { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation Property
    public virtual ApplicationUser User { get; set; } = null!;
}

