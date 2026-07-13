using System;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.AI;
using HomeEmergency.Application.DTOs.Admin;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IAIConversationService
{
    Task<AIConversationDto> CreateAsync(Guid userId, CreateAIConversationRequestDto request, CancellationToken cancellationToken = default);
    Task<PaginatedListDto<AIConversationDto>> GetForUserAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<AIConversationDto> GetByIdAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
    Task<AIMessageDto> AddMessageAsync(Guid userId, Guid conversationId, AddAIMessageRequestDto request, CancellationToken cancellationToken = default);
    Task ArchiveAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default);
}
