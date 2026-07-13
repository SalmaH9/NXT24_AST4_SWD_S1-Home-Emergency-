using System;
using System.Collections.Generic;
using HomeEmergency.Domain.Common;

namespace HomeEmergency.Domain.Entities;

public class AIConversation : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid? SuggestedCategoryId { get; set; }
    public bool IsArchived { get; set; }

    public virtual ApplicationUser User { get; set; } = null!;
    public virtual ICollection<AIMessage> Messages { get; set; } = new List<AIMessage>();
}
