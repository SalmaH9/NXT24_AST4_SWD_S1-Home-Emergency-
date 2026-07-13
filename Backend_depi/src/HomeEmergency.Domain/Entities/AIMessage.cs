using System;
using HomeEmergency.Domain.Common;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Domain.Entities;

public class AIMessage : BaseEntity
{
    public Guid ConversationId { get; set; }
    public AIMessageRole Role { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid? SuggestedCategoryId { get; set; }
    public string? MetadataJson { get; set; }

    public virtual AIConversation Conversation { get; set; } = null!;
}
