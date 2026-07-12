using System;

namespace HomeEmergency.Domain.Entities;

public class CustomerProfile
{
    public Guid UserId { get; set; }
    public string? PreferredLanguage { get; set; }
    public string? DefaultAddress { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public DateTime? UpdatedAt { get; set; }

    // Navigation Property
    public virtual ApplicationUser User { get; set; } = null!;
}

