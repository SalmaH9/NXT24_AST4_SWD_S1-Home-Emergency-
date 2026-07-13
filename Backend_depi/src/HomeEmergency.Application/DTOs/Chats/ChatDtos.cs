using System;
using System.Collections.Generic;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.DTOs.Chats;

public class CreateChatRequestDto
{
    public Guid? ServiceRequestId { get; set; }
    public Guid? RelatedExaminationId { get; set; }
    public ChatType ChatType { get; set; }
    public List<Guid> ParticipantUserIds { get; set; } = new();
}

public class ChatSummaryDto
{
    public Guid Id { get; set; }
    public Guid? ServiceRequestId { get; set; }
    public Guid? RelatedExaminationId { get; set; }
    public ChatType ChatType { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ClosedAt { get; set; }
    public List<ChatParticipantDto> Participants { get; set; } = new();
    public MessageDto? LastMessage { get; set; }
}

public class ChatParticipantDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
    public bool IsActive { get; set; }
}

public class CreateMessageRequestDto
{
    public string Content { get; set; } = string.Empty;
}

public class UpdateMessageRequestDto
{
    public string Content { get; set; } = string.Empty;
}

public class MessageDto
{
    public Guid Id { get; set; }
    public Guid ChatId { get; set; }
    public Guid SenderId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public MessageType MessageType { get; set; }
    public DateTime SentAt { get; set; }
    public DateTime? EditedAt { get; set; }
    public bool IsEdited { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime? ReadAt { get; set; }
}
