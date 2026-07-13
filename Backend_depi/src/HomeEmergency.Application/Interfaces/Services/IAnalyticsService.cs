using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IAnalyticsService
{
    Task<UserAnalyticsDto> GetUserAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default);
    Task<CommunicationAnalyticsDto> GetCommunicationAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default);
    Task<RatingAnalyticsDto> GetRatingAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default);
    Task<AdvertisementAnalyticsDto> GetAdvertisementAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default);
    Task<AIAnalyticsDto> GetAIAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default);
    Task<EmptyAnalyticsDto> GetServiceDemandAnalyticsAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default);
}
