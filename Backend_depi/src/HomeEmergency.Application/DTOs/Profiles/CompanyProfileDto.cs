namespace HomeEmergency.Application.DTOs.Profiles;

public class CompanyProfileDto
{
    public string CompanyName { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string? WebsiteUrl { get; set; }
    public string? Bio { get; set; }
    public int EmployeeCount { get; set; }
    public string? CompanyLogoUrl { get; set; }
}

