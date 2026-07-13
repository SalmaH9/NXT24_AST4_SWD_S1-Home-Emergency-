using System;
using System.Collections.Generic;
using HomeEmergency.Domain.Common;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Domain.Entities;

public class Advertisement : BaseEntity
{
    public Guid CompanyUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImagePath { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public AdvertisementStatus Status { get; set; } = AdvertisementStatus.Draft;
    public string? RejectionReason { get; set; }
    public bool IsDeleted { get; set; }

    public virtual ApplicationUser CompanyUser { get; set; } = null!;
    public virtual ICollection<AdvertisementCategory> Categories { get; set; } = new List<AdvertisementCategory>();
}
