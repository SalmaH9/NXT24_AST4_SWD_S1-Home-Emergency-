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

public class AdminDashboardService : IAdminDashboardService
{
    private readonly ApplicationDbContext _context;

    public AdminDashboardService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var userRoleQuery = from userRole in _context.UserRoles
                            join role in _context.Roles on userRole.RoleId equals role.Id
                            select new { userRole.UserId, role.Name };

        var providerIds = await userRoleQuery.Where(x => x.Name == "Provider").Select(x => x.UserId).ToListAsync(cancellationToken);

        return new DashboardSummaryDto
        {
            TotalUsers = await _context.Users.CountAsync(cancellationToken),
            ActiveUsers = await _context.Users.CountAsync(x => x.Status == AccountStatus.Active, cancellationToken),
            SuspendedUsers = await _context.Users.CountAsync(x => x.Status == AccountStatus.Suspended, cancellationToken),
            Customers = await userRoleQuery.CountAsync(x => x.Name == "Customer", cancellationToken),
            Providers = await userRoleQuery.CountAsync(x => x.Name == "Provider", cancellationToken),
            Companies = await userRoleQuery.CountAsync(x => x.Name == "Company", cancellationToken),
            PendingVerifications = await _context.VerificationDocuments.CountAsync(x => x.Status == DocumentStatus.Pending, cancellationToken),
            ActiveSubscriptions = await _context.Subscriptions.CountAsync(x => x.Status == "Active" && x.EndDate >= now, cancellationToken),
            ExpiredSubscriptions = await _context.Subscriptions.CountAsync(x => x.EndDate < now, cancellationToken),
            PendingAdvertisements = await _context.Advertisements.CountAsync(x => x.Status == AdvertisementStatus.Pending && !x.IsDeleted, cancellationToken),
            ActiveAdvertisements = await _context.Advertisements.CountAsync(x => x.Status == AdvertisementStatus.Approved && x.StartDate <= now && x.EndDate >= now && !x.IsDeleted, cancellationToken),
            ExpiredAdvertisements = await _context.Advertisements.CountAsync(x => x.EndDate < now && !x.IsDeleted, cancellationToken),
            TotalChats = await _context.Chats.CountAsync(cancellationToken),
            TotalMessages = await _context.Messages.CountAsync(cancellationToken),
            UnreadNotifications = await _context.Notifications.CountAsync(x => !x.IsRead, cancellationToken),
            TotalRatings = await _context.Ratings.CountAsync(cancellationToken),
            AverageProviderRating = providerIds.Count == 0
                ? 0
                : await _context.Ratings.Where(x => x.ProviderId != null).AverageAsync(x => (double?)x.RatingValue, cancellationToken) ?? 0,
            WarningsIssued = await _context.UserWarnings.CountAsync(cancellationToken),
            AIConversations = await _context.AIConversations.CountAsync(cancellationToken)
        };
    }

    public async Task<PaginatedListDto<RecentActivityItemDto>> GetRecentActivityAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var items = await _context.Notifications
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAt)
            .Take(100)
            .Select(x => new RecentActivityItemDto
            {
                Type = x.Type.ToString(),
                Description = x.Title,
                CreatedAt = x.CreatedAt
            })
            .ToListAsync(cancellationToken);

        var totalCount = items.Count;
        var pagedItems = items.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToList();
        return new PaginatedListDto<RecentActivityItemDto>(pagedItems, totalCount, pageNumber, pageSize);
    }

    public async Task<PaginatedListDto<TimeSeriesPointDto>> GetUserGrowthAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default)
    {
        var from = query.From?.ToDateTime(TimeOnly.MinValue) ?? DateTime.UtcNow.AddDays(-30);
        var to = query.To?.ToDateTime(TimeOnly.MaxValue) ?? DateTime.UtcNow;

        var items = await _context.Users
            .AsNoTracking()
            .Where(x => x.CreatedAt >= from && x.CreatedAt <= to)
            .GroupBy(x => x.CreatedAt.Date)
            .Select(x => new TimeSeriesPointDto
            {
                Label = x.Key.ToString("yyyy-MM-dd"),
                Value = x.Count()
            })
            .OrderBy(x => x.Label)
            .ToListAsync(cancellationToken);

        return new PaginatedListDto<TimeSeriesPointDto>(items, items.Count, 1, Math.Max(items.Count, 1));
    }

    public async Task<RatingOverviewDto> GetRatingOverviewAsync(CancellationToken cancellationToken = default)
    {
        var ratings = await _context.Ratings.AsNoTracking().ToListAsync(cancellationToken);
        return new RatingOverviewDto
        {
            AverageRating = ratings.Count == 0 ? 0 : ratings.Average(x => x.RatingValue),
            TotalRatings = ratings.Count,
            Distribution = Enumerable.Range(1, 5)
                .Select(value => new TimeSeriesPointDto
                {
                    Label = value.ToString(),
                    Value = ratings.Count(x => x.RatingValue == value)
                }).ToList()
        };
    }

    public async Task<AdvertisementOverviewDto> GetAdvertisementOverviewAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        return new AdvertisementOverviewDto
        {
            Pending = await _context.Advertisements.CountAsync(x => x.Status == AdvertisementStatus.Pending && !x.IsDeleted, cancellationToken),
            Active = await _context.Advertisements.CountAsync(x => x.Status == AdvertisementStatus.Approved && x.StartDate <= now && x.EndDate >= now && !x.IsDeleted, cancellationToken),
            Rejected = await _context.Advertisements.CountAsync(x => x.Status == AdvertisementStatus.Rejected && !x.IsDeleted, cancellationToken),
            ExpiringSoon = await _context.Advertisements.CountAsync(x => x.EndDate >= now && x.EndDate <= now.AddDays(3) && !x.IsDeleted, cancellationToken)
        };
    }

    public async Task<CommunicationOverviewDto> GetCommunicationOverviewAsync(CancellationToken cancellationToken = default)
    {
        var totalChats = await _context.Chats.CountAsync(cancellationToken);
        var totalMessages = await _context.Messages.CountAsync(cancellationToken);
        return new CommunicationOverviewDto
        {
            TotalChats = totalChats,
            ActiveChats = await _context.Chats.CountAsync(x => x.IsActive, cancellationToken),
            TotalMessages = totalMessages,
            AverageMessagesPerChat = totalChats == 0 ? 0 : (double)totalMessages / totalChats
        };
    }
}
