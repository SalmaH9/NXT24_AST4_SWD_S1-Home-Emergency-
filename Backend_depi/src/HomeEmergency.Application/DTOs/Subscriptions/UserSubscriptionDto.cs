using System;

namespace HomeEmergency.Application.DTOs.Subscriptions;

public class UserSubscriptionDto
{
    public Guid Id { get; set; }
    public Guid SubscriptionPlanId { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public decimal PricePaid { get; set; }
    public string PaymentReference { get; set; } = string.Empty;
}

