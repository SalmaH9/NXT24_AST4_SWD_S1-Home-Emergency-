using System;
using HomeEmergency.Domain.Common;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Domain.Entities;

public class Rating : BaseEntity
{
    public Guid? ServiceRequestId { get; set; }
    public Guid? ServiceExecutionId { get; set; }
    public Guid SenderUserId { get; set; }
    public Guid ReceiverUserId { get; set; }
    public Guid? ProviderId { get; set; }
    public int RatingValue { get; set; }
    public string? Comment { get; set; }
    public RatingStage RatingStage { get; set; }

    public virtual ApplicationUser SenderUser { get; set; } = null!;
    public virtual ApplicationUser ReceiverUser { get; set; } = null!;
    public virtual ProviderProfile? Provider { get; set; }
}
