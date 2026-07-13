using System;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.DTOs.Chats;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IChatService
{
    Task<ChatSummaryDto> CreateChatAsync(Guid userId, CreateChatRequestDto request, CancellationToken cancellationToken = default);
    Task<PaginatedListDto<ChatSummaryDto>> GetChatsAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<ChatSummaryDto> GetChatAsync(Guid userId, Guid chatId, CancellationToken cancellationToken = default);
    Task<PaginatedListDto<MessageDto>> GetMessagesAsync(Guid userId, Guid chatId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<MessageDto> CreateMessageAsync(Guid userId, Guid chatId, CreateMessageRequestDto request, CancellationToken cancellationToken = default);
    Task<MessageDto> UpdateMessageAsync(Guid userId, Guid chatId, Guid messageId, UpdateMessageRequestDto request, CancellationToken cancellationToken = default);
    Task DeleteMessageAsync(Guid userId, Guid chatId, Guid messageId, CancellationToken cancellationToken = default);
    Task MarkChatAsReadAsync(Guid userId, Guid chatId, CancellationToken cancellationToken = default);
    Task<bool> CanJoinChatAsync(Guid userId, Guid chatId, CancellationToken cancellationToken = default);
}
