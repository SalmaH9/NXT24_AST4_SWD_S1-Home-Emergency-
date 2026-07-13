using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.DTOs.Ratings;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;
using HomeEmergency.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HomeEmergency.Infrastructure.Services;

public class RatingService : IRatingService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public RatingService(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<RatingDto> CreateAsync(Guid userId, CreateRatingRequestDto request, CancellationToken cancellationToken = default)
    {
        if (request.RatingValue < 1 || request.RatingValue > 5)
        {
            throw new ArgumentException("Rating value must be between 1 and 5.");
        }

        if (request.ReceiverUserId == userId)
        {
            throw new ArgumentException("Users cannot rate themselves.");
        }

        var receiver = await _userManager.FindByIdAsync(request.ReceiverUserId.ToString());
        if (receiver == null || receiver.IsDeleted)
        {
            throw new KeyNotFoundException("Receiver not found.");
        }

        var duplicateExists = await _context.Ratings.AnyAsync(x =>
            x.SenderUserId == userId &&
            x.ReceiverUserId == request.ReceiverUserId &&
            x.ServiceRequestId == request.ServiceRequestId &&
            x.ServiceExecutionId == request.ServiceExecutionId &&
            x.RatingStage == request.RatingStage, cancellationToken);

        if (duplicateExists)
        {
            throw new InvalidOperationException("A rating already exists for this stage and target.");
        }

        var rating = new Rating
        {
            ServiceRequestId = request.ServiceRequestId,
            ServiceExecutionId = request.ServiceExecutionId,
            SenderUserId = userId,
            ReceiverUserId = request.ReceiverUserId,
            ProviderId = request.ProviderId,
            RatingValue = request.RatingValue,
            Comment = request.Comment?.Trim(),
            RatingStage = request.RatingStage,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = userId
        };

        _context.Ratings.Add(rating);
        await _context.SaveChangesAsync(cancellationToken);
        await RecalculateProviderAverageIfNeededAsync(request.ProviderId, cancellationToken);

        return await GetRatingByIdAsync(rating.Id, cancellationToken);
    }

    public Task<PaginatedListDto<RatingDto>> GetReceivedAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        return GetPagedRatingsAsync(_context.Ratings.Where(x => x.ReceiverUserId == userId), pageNumber, pageSize, cancellationToken);
    }

    public Task<PaginatedListDto<RatingDto>> GetGivenAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        return GetPagedRatingsAsync(_context.Ratings.Where(x => x.SenderUserId == userId), pageNumber, pageSize, cancellationToken);
    }

    public Task<PaginatedListDto<RatingDto>> GetProviderRatingsAsync(Guid providerId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        return GetPagedRatingsAsync(_context.Ratings.Where(x => x.ProviderId == providerId), pageNumber, pageSize, cancellationToken);
    }

    public async Task<RatingSummaryDto> GetUserSummaryAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var ratings = await _context.Ratings
            .AsNoTracking()
            .Where(x => x.ReceiverUserId == userId)
            .ToListAsync(cancellationToken);

        return new RatingSummaryDto
        {
            UserId = userId,
            TotalRatings = ratings.Count,
            AverageRating = ratings.Count == 0 ? 0 : ratings.Average(x => x.RatingValue),
            OneStarCount = ratings.Count(x => x.RatingValue == 1),
            TwoStarCount = ratings.Count(x => x.RatingValue == 2),
            ThreeStarCount = ratings.Count(x => x.RatingValue == 3),
            FourStarCount = ratings.Count(x => x.RatingValue == 4),
            FiveStarCount = ratings.Count(x => x.RatingValue == 5)
        };
    }

    private async Task<PaginatedListDto<RatingDto>> GetPagedRatingsAsync(IQueryable<Rating> query, int pageNumber, int pageSize, CancellationToken cancellationToken)
    {
        query = query
            .AsNoTracking()
            .Include(x => x.SenderUser)
            .Include(x => x.ReceiverUser)
            .OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var ratings = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);

        return new PaginatedListDto<RatingDto>(ratings.Select(Map).ToList(), totalCount, pageNumber, pageSize);
    }

    private async Task RecalculateProviderAverageIfNeededAsync(Guid? providerId, CancellationToken cancellationToken)
    {
        if (!providerId.HasValue)
        {
            return;
        }

        var provider = await _context.ProviderProfiles.FirstOrDefaultAsync(x => x.UserId == providerId.Value, cancellationToken);
        if (provider == null)
        {
            return;
        }

        provider.AverageRating = await _context.Ratings
            .Where(x => x.ProviderId == providerId.Value)
            .Select(x => (decimal?)x.RatingValue)
            .AverageAsync(cancellationToken) ?? 0m;

        await _context.SaveChangesAsync(cancellationToken);
    }

    private async Task<RatingDto> GetRatingByIdAsync(Guid ratingId, CancellationToken cancellationToken)
    {
        var rating = await _context.Ratings
            .AsNoTracking()
            .Include(x => x.SenderUser)
            .Include(x => x.ReceiverUser)
            .FirstAsync(x => x.Id == ratingId, cancellationToken);

        return Map(rating);
    }

    private static RatingDto Map(Rating rating)
    {
        return new RatingDto
        {
            Id = rating.Id,
            ServiceRequestId = rating.ServiceRequestId,
            ServiceExecutionId = rating.ServiceExecutionId,
            SenderUserId = rating.SenderUserId,
            SenderName = rating.SenderUser.FullName,
            ReceiverUserId = rating.ReceiverUserId,
            ReceiverName = rating.ReceiverUser.FullName,
            ProviderId = rating.ProviderId,
            RatingValue = rating.RatingValue,
            Comment = rating.Comment,
            RatingStage = rating.RatingStage,
            CreatedAt = rating.CreatedAt,
            UpdatedAt = rating.UpdatedAt
        };
    }
}
