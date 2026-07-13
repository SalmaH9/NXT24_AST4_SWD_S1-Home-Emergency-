using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.AI;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HomeEmergency.Infrastructure.Services;

public class AIConversationService : IAIConversationService
{
    private readonly ApplicationDbContext _context;

    public AIConversationService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AIConversationDto> CreateAsync(Guid userId, CreateAIConversationRequestDto request, CancellationToken cancellationToken = default)
    {
        var conversation = new AIConversation
        {
            UserId = userId,
            Title = request.Title.Trim(),
            SuggestedCategoryId = request.SuggestedCategoryId,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.AIConversations.Add(conversation);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(userId, conversation.Id, cancellationToken);
    }

    public async Task<PaginatedListDto<AIConversationDto>> GetForUserAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.AIConversations
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PaginatedListDto<AIConversationDto>(items.Select(MapConversationSummary).ToList(), totalCount, pageNumber, pageSize);
    }

    public async Task<AIConversationDto> GetByIdAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default)
    {
        var conversation = await _context.AIConversations
            .AsNoTracking()
            .Include(x => x.Messages.OrderBy(m => m.CreatedAt))
            .FirstOrDefaultAsync(x => x.Id == conversationId && x.UserId == userId, cancellationToken);

        if (conversation == null)
        {
            throw new KeyNotFoundException("Conversation not found.");
        }

        return MapConversation(conversation);
    }

    public async Task<AIMessageDto> AddMessageAsync(Guid userId, Guid conversationId, AddAIMessageRequestDto request, CancellationToken cancellationToken = default)
    {
        var conversation = await _context.AIConversations
            .FirstOrDefaultAsync(x => x.Id == conversationId && x.UserId == userId, cancellationToken);

        if (conversation == null)
        {
            throw new KeyNotFoundException("Conversation not found.");
        }

        if (conversation.IsArchived)
        {
            throw new InvalidOperationException("Archived conversations cannot be modified.");
        }

        var message = new AIMessage
        {
            ConversationId = conversationId,
            Role = request.Role,
            Content = request.Content.Trim(),
            SuggestedCategoryId = request.SuggestedCategoryId,
            MetadataJson = request.MetadataJson,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        conversation.UpdatedAt = DateTime.UtcNow;
        _context.AIMessages.Add(message);
        await _context.SaveChangesAsync(cancellationToken);

        return new AIMessageDto
        {
            Id = message.Id,
            Role = message.Role,
            Content = message.Content,
            SuggestedCategoryId = message.SuggestedCategoryId,
            MetadataJson = message.MetadataJson,
            CreatedAt = message.CreatedAt
        };
    }

    public async Task ArchiveAsync(Guid userId, Guid conversationId, CancellationToken cancellationToken = default)
    {
        var conversation = await _context.AIConversations
            .FirstOrDefaultAsync(x => x.Id == conversationId && x.UserId == userId, cancellationToken);

        if (conversation == null)
        {
            throw new KeyNotFoundException("Conversation not found.");
        }

        conversation.IsArchived = true;
        conversation.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    private static AIConversationDto MapConversationSummary(AIConversation conversation)
    {
        return new AIConversationDto
        {
            Id = conversation.Id,
            Title = conversation.Title,
            SuggestedCategoryId = conversation.SuggestedCategoryId,
            IsArchived = conversation.IsArchived,
            CreatedAt = conversation.CreatedAt,
            UpdatedAt = conversation.UpdatedAt
        };
    }

    private static AIConversationDto MapConversation(AIConversation conversation)
    {
        return new AIConversationDto
        {
            Id = conversation.Id,
            Title = conversation.Title,
            SuggestedCategoryId = conversation.SuggestedCategoryId,
            IsArchived = conversation.IsArchived,
            CreatedAt = conversation.CreatedAt,
            UpdatedAt = conversation.UpdatedAt,
            Messages = conversation.Messages.Select(x => new AIMessageDto
            {
                Id = x.Id,
                Role = x.Role,
                Content = x.Content,
                SuggestedCategoryId = x.SuggestedCategoryId,
                MetadataJson = x.MetadataJson,
                CreatedAt = x.CreatedAt
            }).ToList()
        };
    }
}
