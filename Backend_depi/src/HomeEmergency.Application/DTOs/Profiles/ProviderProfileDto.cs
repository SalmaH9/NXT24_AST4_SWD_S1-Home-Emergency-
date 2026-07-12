namespace HomeEmergency.Application.DTOs.Profiles;

public class ProviderProfileDto
{
    public string? Bio { get; set; }
    public string ServiceCategory { get; set; } = string.Empty;
    public int ServiceRadiusKm { get; set; }
    public decimal AverageRating { get; set; }
    public string AvailabilityStatus { get; set; } = "Offline";
    public int ExperienceYears { get; set; }
    public string? ProfilePictureUrl { get; set; }
}

