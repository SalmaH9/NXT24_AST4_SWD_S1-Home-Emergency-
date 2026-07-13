using System;
using System.Collections.Generic;
using HomeEmergency.Domain.Common;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Domain.Entities;

public class Chat : BaseEntity
{
    public Guid? ServiceRequestId { get; set; }
    public Guid? RelatedExaminationId { get; set; }
    public ChatType ChatType { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? ClosedAt { get; set; }

    public virtual ICollection<ChatParticipant> Participants { get; set; } = new List<ChatParticipant>();
    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();
}
