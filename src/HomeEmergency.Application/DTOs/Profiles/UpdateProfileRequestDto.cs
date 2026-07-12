namespace HomeEmergency.Application.DTOs.Profiles;

public class UpdateProfileRequestDto
{
    // General user properties
    public string FullName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }

    // Customer properties
    public string? PreferredLanguage { get; set; }
    public string? DefaultAddress { get; set; }

    // Provider properties
    public string? Bio { get; set; }
    public string? ServiceCategory { get; set; }
    public int? ServiceRadiusKm { get; set; }
    public string? AvailabilityStatus { get; set; }
    public int? ExperienceYears { get; set; }

    // Company properties
    public string? CompanyName { get; set; }
    public string? RegistrationNumber { get; set; }
    public string? WebsiteUrl { get; set; }
    public int? EmployeeCount { get; set; }
}

