using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/dashboard")]
public class AdminDashboardController : ControllerBase
{
    private readonly IAdminDashboardService _dashboardService;

    public AdminDashboardController(IAdminDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> Summary(CancellationToken cancellationToken)
        => Ok(await _dashboardService.GetSummaryAsync(cancellationToken));

    [HttpGet("recent-activity")]
    public async Task<IActionResult> RecentActivity([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await _dashboardService.GetRecentActivityAsync(pageNumber, pageSize, cancellationToken));

    [HttpGet("user-growth")]
    public async Task<IActionResult> UserGrowth([FromQuery] AnalyticsQueryDto query, CancellationToken cancellationToken)
        => Ok(await _dashboardService.GetUserGrowthAsync(query, cancellationToken));

    [HttpGet("rating-overview")]
    public async Task<IActionResult> RatingOverview(CancellationToken cancellationToken)
        => Ok(await _dashboardService.GetRatingOverviewAsync(cancellationToken));

    [HttpGet("advertisement-overview")]
    public async Task<IActionResult> AdvertisementOverview(CancellationToken cancellationToken)
        => Ok(await _dashboardService.GetAdvertisementOverviewAsync(cancellationToken));

    [HttpGet("communication-overview")]
    public async Task<IActionResult> CommunicationOverview(CancellationToken cancellationToken)
        => Ok(await _dashboardService.GetCommunicationOverviewAsync(cancellationToken));
}
