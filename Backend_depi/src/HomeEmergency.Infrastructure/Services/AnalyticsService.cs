using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Enums;
using HomeEmergency.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HomeEmergency.Infrastructure.Services;

public class AnalyticsService : IAnalyticsService
{
    private readonly ApplicationDbContext _context;

    public AnalyticsService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserAnalyticsDto> GetUserAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default)
    {
        var (from, to) = ResolveDateRange(query);
        var roleCounts = await (from userRole in _context.UserRoles
                                join role in _context.Roles on userRole.RoleId equals role.Id
                                group userRole by role.Name into grouped
                                select new TimeSeriesPointDto
                                {
                                    Label = grouped.Key ?? "Unknown",
                                    Value = grouped.Count()
                                }).ToListAsync(cancellationToken);

        return new UserAnalyticsDto
        {
            Registrations = await _context.Users.AsNoTracking()
                .Where(x => x.CreatedAt >= from && x.CreatedAt <= to)
                .GroupBy(x => x.CreatedAt.Date)
                .Select(x => new TimeSeriesPointDto { Label = x.Key.ToString("yyyy-MM-dd"), Value = x.Count() })
                .OrderBy(x => x.Label)
                .ToListAsync(cancellationToken),
            Roles = roleCounts,
            Statuses = await _context.Users.AsNoTracking()
                .GroupBy(x => x.Status)
                .Select(x => new TimeSeriesPointDto { Label = x.Key.ToString(), Value = x.Count() })
                .ToListAsync(cancellationToken)
        };
    }

    public async Task<CommunicationAnalyticsDto> GetCommunicationAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default)
    {
        var (from, to) = ResolveDateRange(query);
        var totalChats = await _context.Chats.CountAsync(cancellationToken);
        var totalMessages = await _context.Messages.CountAsync(cancellationToken);

        return new CommunicationAnalyticsDto
        {
            TotalChats = totalChats,
            TotalMessages = totalMessages,
            ActiveChats = await _context.Chats.CountAsync(x => x.IsActive, cancellationToken),
            AverageMessagesPerChat = totalChats == 0 ? 0 : (double)totalMessages / totalChats,
            MessagesPerPeriod = await _context.Messages.AsNoTracking()
                .Where(x => x.SentAt >= from && x.SentAt <= to)
                .GroupBy(x => x.SentAt.Date)
                .Select(x => new TimeSeriesPointDto { Label = x.Key.ToString("yyyy-MM-dd"), Value = x.Count() })
                .OrderBy(x => x.Label)
                .ToListAsync(cancellationToken)
        };
    }

    public async Task<RatingAnalyticsDto> GetRatingAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default)
    {
        var ratings = await _context.Ratings.AsNoTracking().Include(x => x.ReceiverUser).ToListAsync(cancellationToken);
        return new RatingAnalyticsDto
        {
            AverageRating = ratings.Count == 0 ? 0 : ratings.Average(x => x.RatingValue),
            Distribution = Enumerable.Range(1, 5)
                .Select(value => new TimeSeriesPointDto { Label = value.ToString(), Value = ratings.Count(x => x.RatingValue == value) })
                .ToList(),
            LowRatedUsers = ratings.GroupBy(x => new { x.ReceiverUserId, x.ReceiverUser.FullName })
                .Select(grouped => new LowRatedUserDto
                {
                    UserId = grouped.Key.ReceiverUserId,
                    FullName = grouped.Key.FullName,
                    AverageRating = grouped.Average(x => x.RatingValue),
                    RatingsCount = grouped.Count()
                })
                .Where(x => x.AverageRating <= 2.5)
                .OrderBy(x => x.AverageRating)
                .Take(10)
                .ToList()
        };
    }

    public async Task<AdvertisementAnalyticsDto> GetAdvertisementAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return new AdvertisementAnalyticsDto
        {
            StatusCounts = await _context.Advertisements.AsNoTracking()
                .Where(x => !x.IsDeleted)
                .GroupBy(x => x.Status)
                .Select(x => new TimeSeriesPointDto { Label = x.Key.ToString(), Value = x.Count() })
                .ToListAsync(cancellationToken),
            ActiveAdsByCategory = await _context.AdvertisementCategories.AsNoTracking()
                .Where(x => x.Advertisement.Status == AdvertisementStatus.Approved &&
                            x.Advertisement.StartDate <= now &&
                            x.Advertisement.EndDate >= now &&
                            !x.Advertisement.IsDeleted)
                .GroupBy(x => x.ServiceCategoryId)
                .Select(x => new TimeSeriesPointDto { Label = x.Key.ToString(), Value = x.Count() })
                .ToListAsync(cancellationToken)
        };
    }

    public async Task<AIAnalyticsDto> GetAIAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default)
    {
        var (from, to) = ResolveDateRange(query);
        var conversations = await _context.AIConversations.AsNoTracking().ToListAsync(cancellationToken);
        var messageCounts = await _context.AIMessages.AsNoTracking()
            .GroupBy(x => x.ConversationId)
            .Select(x => x.Count())
            .ToListAsync(cancellationToken);

        return new AIAnalyticsDto
        {
            ArchivedConversations = conversations.Count(x => x.IsArchived),
            ActiveConversations = conversations.Count(x => !x.IsArchived),
            AverageMessagesPerConversation = messageCounts.Count == 0 ? 0 : messageCounts.Average(),
            ConversationsPerPeriod = conversations
                .Where(x => x.CreatedAt >= from && x.CreatedAt <= to)
                .GroupBy(x => x.CreatedAt.Date)
                .Select(x => new TimeSeriesPointDto { Label = x.Key.ToString("yyyy-MM-dd"), Value = x.Count() })
                .OrderBy(x => x.Label)
                .ToList(),
            SuggestedCategories = conversations.Where(x => x.SuggestedCategoryId.HasValue)
                .GroupBy(x => x.SuggestedCategoryId!.Value)
                .Select(x => new TimeSeriesPointDto { Label = x.Key.ToString(), Value = x.Count() })
                .ToList()
        };
    }

    public Task<EmptyAnalyticsDto> GetServiceDemandAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(new EmptyAnalyticsDto
        {
            Message = "Service-demand analytics are unavailable because service request and location models are not present in this repository."
        });
    }

    private static (DateTime From, DateTime To) ResolveDateRange(AnalyticsQueryDto query)
    {
        var from = query.From?.ToDateTime(TimeOnly.MinValue) ?? DateTime.UtcNow.AddDays(-30);
        var to = query.To?.ToDateTime(TimeOnly.MaxValue) ?? DateTime.UtcNow;
        if (from > to)
        {
            throw new ArgumentException("'from' must be earlier than or equal to 'to'.");
        }

        return (from, to);
    }
}
