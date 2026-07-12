using System;
using HomeEmergency.Domain.Common;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Domain.Entities;

public class VerificationDocument : BaseEntity
{
    public Guid UserId { get; set; }
    public DocumentType DocumentType { get; set; }
    public string DocumentUrl { get; set; } = string.Empty;
    public DocumentStatus Status { get; set; } = DocumentStatus.Pending;
    public Guid? ReviewedBy { get; set; }
    public string? ReviewComments { get; set; }

    // Navigation Properties
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual ApplicationUser? Reviewer { get; set; }
}

