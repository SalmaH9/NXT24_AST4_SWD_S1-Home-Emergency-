using System;

namespace HomeEmergency.Domain.Entities;

public class ProviderProfile
{
    public Guid UserId { get; set; }
    public string? Bio { get; set; }
    public string ServiceCategory { get; set; } = string.Empty;
    public int ServiceRadiusKm { get; set; } = 15;
    public decimal AverageRating { get; set; } = 0.00m;
    public string AvailabilityStatus { get; set; } = "Offline";
    public int ExperienceYears { get; set; } = 0;
    public string? ProfilePictureUrl { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation Property
    public virtual ApplicationUser User { get; set; } = null!;
}

