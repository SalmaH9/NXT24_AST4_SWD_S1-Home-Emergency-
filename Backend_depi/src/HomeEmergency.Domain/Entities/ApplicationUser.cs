using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Domain.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    public string FullName { get; set; } = string.Empty;
    public AccountStatus Status { get; set; } = AccountStatus.Pending;
    public bool IsDeleted { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Suspension Details
    public string? SuspensionReason { get; set; }
    public DateTime? SuspendedAt { get; set; }
    public Guid? SuspendedBy { get; set; }

    // Navigation Properties (1:1 Profiles)
    public virtual CustomerProfile? CustomerProfile { get; set; }
    public virtual ProviderProfile? ProviderProfile { get; set; }
    public virtual CompanyProfile? CompanyProfile { get; set; }

    // Navigation Properties (1:Many custom action links)
    public virtual ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    public virtual ICollection<VerificationDocument> SubmittedDocuments { get; set; } = new List<VerificationDocument>();
    public virtual ICollection<VerificationDocument> ReviewedDocuments { get; set; } = new List<VerificationDocument>();
    public virtual ICollection<Subscription> Subscriptions { get; set; } = new List<Subscription>();
    public virtual ICollection<UserWarning> WarningsReceived { get; set; } = new List<UserWarning>();
    public virtual ICollection<UserWarning> WarningsIssued { get; set; } = new List<UserWarning>();
}

