using System;
using System.Collections.Generic;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.DTOs.AI;

public class CreateAIConversationRequestDto
{
    public string Title { get; set; } = string.Empty;
    public Guid? SuggestedCategoryId { get; set; }
}

public class AddAIMessageRequestDto
{
    public AIMessageRole Role { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid? SuggestedCategoryId { get; set; }
    public string? MetadataJson { get; set; }
}

public class AIConversationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public Guid? SuggestedCategoryId { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<AIMessageDto> Messages { get; set; } = new();
}

public class AIMessageDto
{
    public Guid Id { get; set; }
    public AIMessageRole Role { get; set; }
    public string Content { get; set; } = string.Empty;
    public Guid? SuggestedCategoryId { get; set; }
    public string? MetadataJson { get; set; }
    public DateTime CreatedAt { get; set; }
}
