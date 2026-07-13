using System;
using HomeEmergency.Domain.Common;

namespace HomeEmergency.Domain.Entities;

public class ChatParticipant : BaseEntity
{
    public Guid ChatId { get; set; }
    public Guid UserId { get; set; }
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LeftAt { get; set; }
    public bool IsActive { get; set; } = true;

    public virtual Chat Chat { get; set; } = null!;
    public virtual ApplicationUser User { get; set; } = null!;
}
