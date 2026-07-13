using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IAdminDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync(CancellationToken cancellationToken = default);
    Task<PaginatedListDto<RecentActivityItemDto>> GetRecentActivityAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<PaginatedListDto<TimeSeriesPointDto>> GetUserGrowthAsync(AnalyticsQueryDto query, CancellationToken cancellationToken = default);
    Task<RatingOverviewDto> GetRatingOverviewAsync(CancellationToken cancellationToken = default);
    Task<AdvertisementOverviewDto> GetAdvertisementOverviewAsync(CancellationToken cancellationToken = default);
    Task<CommunicationOverviewDto> GetCommunicationOverviewAsync(CancellationToken cancellationToken = default);
}
