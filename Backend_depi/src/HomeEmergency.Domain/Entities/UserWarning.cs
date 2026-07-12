using System;
using HomeEmergency.Domain.Common;

namespace HomeEmergency.Domain.Entities;

public class UserWarning : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid IssuedBy { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string SeverityLevel { get; set; } = "Low"; // e.g. Low, Medium, High

    // Navigation Properties
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual ApplicationUser Admin { get; set; } = null!;
}

