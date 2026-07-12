using System;
using HomeEmergency.Domain.Common;

namespace HomeEmergency.Domain.Entities;

public class Subscription : BaseEntity
{
    public Guid UserId { get; set; }
    public Guid SubscriptionPlanId { get; set; }
    public string Status { get; set; } = "Active"; // Active, Expired, Cancelled
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal PricePaid { get; set; }
    public string PaymentReference { get; set; } = string.Empty;

    // Navigation Properties
    public virtual ApplicationUser User { get; set; } = null!;
    public virtual SubscriptionPlan SubscriptionPlan { get; set; } = null!;
}

