using System;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.DTOs.Ratings;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IRatingService
{
    Task<RatingDto> CreateAsync(Guid userId, CreateRatingRequestDto request, CancellationToken cancellationToken = default);
    Task<PaginatedListDto<RatingDto>> GetReceivedAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<PaginatedListDto<RatingDto>> GetGivenAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<PaginatedListDto<RatingDto>> GetProviderRatingsAsync(Guid providerId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<RatingSummaryDto> GetUserSummaryAsync(Guid userId, CancellationToken cancellationToken = default);
}
