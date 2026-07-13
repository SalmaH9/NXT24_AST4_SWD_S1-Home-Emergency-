using System;
using HomeEmergency.Domain.Common;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Domain.Entities;

public class Message : BaseEntity
{
    public Guid ChatId { get; set; }
    public Guid SenderId { get; set; }
    public string Content { get; set; } = string.Empty;
    public MessageType MessageType { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public DateTime? EditedAt { get; set; }
    public bool IsEdited { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? ReadAt { get; set; }

    public virtual Chat Chat { get; set; } = null!;
    public virtual ApplicationUser Sender { get; set; } = null!;
}
