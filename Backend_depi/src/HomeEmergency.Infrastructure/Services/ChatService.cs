using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.DTOs.Chats;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;
using HomeEmergency.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HomeEmergency.Infrastructure.Services;

public class ChatService : IChatService
{
    private const int MaxMessageLength = 4000;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly INotificationService _notificationService;
    private readonly IRealTimeChatDispatcher _realTimeChatDispatcher;

    public ChatService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        INotificationService notificationService,
        IRealTimeChatDispatcher realTimeChatDispatcher)
    {
        _context = context;
        _userManager = userManager;
        _notificationService = notificationService;
        _realTimeChatDispatcher = realTimeChatDispatcher;
    }

    public async Task<ChatSummaryDto> CreateChatAsync(Guid userId, CreateChatRequestDto request, CancellationToken cancellationToken = default)
    {
        var participantIds = request.ParticipantUserIds
            .Append(userId)
            .Distinct()
            .ToList();

        if (participantIds.Count < 2)
        {
            throw new ArgumentException("A chat must contain at least two participants.");
        }

        var participants = await _userManager.Users
            .Where(x => participantIds.Contains(x.Id) && !x.IsDeleted)
            .ToListAsync(cancellationToken);

        if (participants.Count != participantIds.Count)
        {
            throw new ArgumentException("One or more chat participants do not exist.");
        }

        await ValidateChatParticipantsAsync(request.ChatType, participants);

        var activeCandidateIds = participantIds.OrderBy(x => x).ToList();
        var existingChats = await _context.Chats
            .Include(x => x.Participants)
            .Where(x => x.IsActive &&
                        x.ChatType == request.ChatType &&
                        x.ServiceRequestId == request.ServiceRequestId &&
                        x.RelatedExaminationId == request.RelatedExaminationId)
            .ToListAsync(cancellationToken);

        var duplicateChat = existingChats.FirstOrDefault(chat =>
            chat.Participants.Where(p => p.IsActive).Select(p => p.UserId).OrderBy(x => x).SequenceEqual(activeCandidateIds));

        if (duplicateChat != null)
        {
            return await GetChatAsync(userId, duplicateChat.Id, cancellationToken);
        }

        var chat = new Chat
        {
            ServiceRequestId = request.ServiceRequestId,
            RelatedExaminationId = request.RelatedExaminationId,
            ChatType = request.ChatType,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        foreach (var participantId in participantIds)
        {
            chat.Participants.Add(new ChatParticipant
            {
                UserId = participantId,
                CreatedAt = DateTime.UtcNow,
                JoinedAt = DateTime.UtcNow,
                CreatedBy = userId
            });
        }

        _context.Chats.Add(chat);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetChatAsync(userId, chat.Id, cancellationToken);
    }

    public async Task<PaginatedListDto<ChatSummaryDto>> GetChatsAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Chats
            .AsNoTracking()
            .Where(x => x.Participants.Any(p => p.UserId == userId && p.IsActive))
            .OrderByDescending(x => x.CreatedAt)
            .Include(x => x.Participants)
                .ThenInclude(x => x.User)
            .Include(x => x.Messages.OrderByDescending(m => m.SentAt).Take(1));

        var totalCount = await query.CountAsync(cancellationToken);
        var chats = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        var items = chats.Select(MapChat).ToList();

        return new PaginatedListDto<ChatSummaryDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<ChatSummaryDto> GetChatAsync(Guid userId, Guid chatId, CancellationToken cancellationToken = default)
    {
        var chat = await _context.Chats
            .AsNoTracking()
            .Include(x => x.Participants)
                .ThenInclude(x => x.User)
            .Include(x => x.Messages.OrderByDescending(m => m.SentAt).Take(1))
            .FirstOrDefaultAsync(x => x.Id == chatId, cancellationToken);

        if (chat == null || !chat.Participants.Any(x => x.UserId == userId && x.IsActive))
        {
            throw new KeyNotFoundException("Chat not found.");
        }

        return MapChat(chat);
    }

    public async Task<PaginatedListDto<MessageDto>> GetMessagesAsync(Guid userId, Guid chatId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        await EnsureParticipantAsync(userId, chatId, cancellationToken);

        var query = _context.Messages
            .AsNoTracking()
            .Where(x => x.ChatId == chatId)
            .Include(x => x.Sender)
            .OrderByDescending(x => x.SentAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var messages = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        var items = messages.Select(MapMessage).ToList();

        return new PaginatedListDto<MessageDto>(items, totalCount, pageNumber, pageSize);
    }

    public async Task<MessageDto> CreateMessageAsync(Guid userId, Guid chatId, CreateMessageRequestDto request, CancellationToken cancellationToken = default)
    {
        var chat = await _context.Chats
            .Include(x => x.Participants)
            .FirstOrDefaultAsync(x => x.Id == chatId, cancellationToken);

        if (chat == null || !chat.Participants.Any(x => x.UserId == userId && x.IsActive))
        {
            throw new KeyNotFoundException("Chat not found.");
        }

        if (!chat.IsActive || chat.ClosedAt.HasValue)
        {
            throw new InvalidOperationException("Cannot send messages to an inactive chat.");
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            throw new ArgumentException("Message content is required.");
        }

        if (request.Content.Length > MaxMessageLength)
        {
            throw new ArgumentException($"Message content must not exceed {MaxMessageLength} characters.");
        }

        var message = new Message
        {
            ChatId = chatId,
            SenderId = userId,
            Content = request.Content.Trim(),
            MessageType = MessageType.Text,
            SentAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);

        foreach (var recipientId in chat.Participants.Where(x => x.UserId != userId && x.IsActive).Select(x => x.UserId).Distinct())
        {
            await _notificationService.CreateAsync(recipientId, NotificationType.NewMessage, "New message",
                "You have received a new message.", NotificationReferenceType.Chat, chatId, cancellationToken);
        }

        var persistedMessage = await _context.Messages
            .AsNoTracking()
            .Where(x => x.Id == message.Id)
            .Include(x => x.Sender)
            .FirstAsync(cancellationToken);

        var messageDto = MapMessage(persistedMessage);

        await _realTimeChatDispatcher.SendMessageAsync(chatId, messageDto);

        return messageDto;
    }

    public async Task<MessageDto> UpdateMessageAsync(Guid userId, Guid chatId, Guid messageId, UpdateMessageRequestDto request, CancellationToken cancellationToken = default)
    {
        var message = await _context.Messages
            .Include(x => x.Sender)
            .FirstOrDefaultAsync(x => x.Id == messageId && x.ChatId == chatId, cancellationToken);

        if (message == null)
        {
            throw new KeyNotFoundException("Message not found.");
        }

        if (message.SenderId != userId)
        {
            throw new UnauthorizedAccessException("You are not allowed to edit this message.");
        }

        if (string.IsNullOrWhiteSpace(request.Content))
        {
            throw new ArgumentException("Message content is required.");
        }

        message.Content = request.Content.Trim();
        message.IsEdited = true;
        message.EditedAt = DateTime.UtcNow;
        message.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return MapMessage(message);
    }

    public async Task DeleteMessageAsync(Guid userId, Guid chatId, Guid messageId, CancellationToken cancellationToken = default)
    {
        var message = await _context.Messages
            .FirstOrDefaultAsync(x => x.Id == messageId && x.ChatId == chatId, cancellationToken);

        if (message == null)
        {
            throw new KeyNotFoundException("Message not found.");
        }

        if (message.SenderId != userId)
        {
            throw new UnauthorizedAccessException("You are not allowed to delete this message.");
        }

        message.IsDeleted = true;
        message.Content = "[deleted]";
        message.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkChatAsReadAsync(Guid userId, Guid chatId, CancellationToken cancellationToken = default)
    {
        await EnsureParticipantAsync(userId, chatId, cancellationToken);

        var unreadMessages = await _context.Messages
            .Where(x => x.ChatId == chatId && x.SenderId != userId && x.ReadAt == null)
            .ToListAsync(cancellationToken);

        foreach (var message in unreadMessages)
        {
            message.ReadAt = DateTime.UtcNow;
            message.UpdatedAt = DateTime.UtcNow;
        }

        if (unreadMessages.Count > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public Task<bool> CanJoinChatAsync(Guid userId, Guid chatId, CancellationToken cancellationToken = default)
    {
        return _context.ChatParticipants.AnyAsync(x => x.ChatId == chatId && x.UserId == userId && x.IsActive, cancellationToken);
    }

    private async Task EnsureParticipantAsync(Guid userId, Guid chatId, CancellationToken cancellationToken)
    {
        var canAccess = await _context.ChatParticipants
            .AnyAsync(x => x.ChatId == chatId && x.UserId == userId && x.IsActive, cancellationToken);

        if (!canAccess)
        {
            throw new KeyNotFoundException("Chat not found.");
        }
    }

    private async Task ValidateChatParticipantsAsync(ChatType chatType, List<ApplicationUser> participants)
    {
        var roleMap = new Dictionary<Guid, IList<string>>();
        foreach (var participant in participants)
        {
            roleMap[participant.Id] = await _userManager.GetRolesAsync(participant);
        }

        if (chatType == ChatType.CustomerProvider)
        {
            if (participants.Count != 2 ||
                !roleMap.Values.Any(r => r.Contains("Customer")) ||
                !roleMap.Values.Any(r => r.Contains("Provider")))
            {
                throw new ArgumentException("Customer-provider chats require exactly one customer and one provider.");
            }
        }

        if (chatType == ChatType.ProviderProvider &&
            roleMap.Values.Any(r => !r.Contains("Provider")))
        {
            throw new ArgumentException("Provider-provider chats require provider participants only.");
        }
    }

    private static ChatSummaryDto MapChat(Chat chat)
    {
        return new ChatSummaryDto
        {
            Id = chat.Id,
            ServiceRequestId = chat.ServiceRequestId,
            RelatedExaminationId = chat.RelatedExaminationId,
            ChatType = chat.ChatType,
            IsActive = chat.IsActive,
            CreatedAt = chat.CreatedAt,
            ClosedAt = chat.ClosedAt,
            Participants = chat.Participants
                .Where(x => x.IsActive)
                .Select(x => new ChatParticipantDto
                {
                    UserId = x.UserId,
                    FullName = x.User.FullName,
                    Email = x.User.Email ?? string.Empty,
                    JoinedAt = x.JoinedAt,
                    IsActive = x.IsActive
                }).ToList(),
            LastMessage = chat.Messages.OrderByDescending(x => x.SentAt).Select(MapMessage).FirstOrDefault()
        };
    }

    private static MessageDto MapMessage(Message message)
    {
        return new MessageDto
        {
            Id = message.Id,
            ChatId = message.ChatId,
            SenderId = message.SenderId,
            SenderName = message.Sender?.FullName ?? string.Empty,
            Content = message.Content,
            MessageType = message.MessageType,
            SentAt = message.SentAt,
            EditedAt = message.EditedAt,
            IsEdited = message.IsEdited,
            IsDeleted = message.IsDeleted,
            ReadAt = message.ReadAt
        };
    }
}
