using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/analytics")]
public class AdminAnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _analyticsService;

    public AdminAnalyticsController(IAnalyticsService analyticsService)
    {
        _analyticsService = analyticsService;
    }

    [HttpGet("users")]
    public async Task<IActionResult> Users([FromQuery] AnalyticsQueryDto query, CancellationToken cancellationToken)
        => Ok(await _analyticsService.GetUserAnalyticsAsync(query, cancellationToken));

    [HttpGet("communications")]
    public async Task<IActionResult> Communications([FromQuery] AnalyticsQueryDto query, CancellationToken cancellationToken)
        => Ok(await _analyticsService.GetCommunicationAnalyticsAsync(query, cancellationToken));

    [HttpGet("ratings")]
    public async Task<IActionResult> Ratings([FromQuery] AnalyticsQueryDto query, CancellationToken cancellationToken)
        => Ok(await _analyticsService.GetRatingAnalyticsAsync(query, cancellationToken));

    [HttpGet("advertisements")]
    public async Task<IActionResult> Advertisements([FromQuery] AnalyticsQueryDto query, CancellationToken cancellationToken)
        => Ok(await _analyticsService.GetAdvertisementAnalyticsAsync(query, cancellationToken));

    [HttpGet("ai")]
    public async Task<IActionResult> AI([FromQuery] AnalyticsQueryDto query, CancellationToken cancellationToken)
        => Ok(await _analyticsService.GetAIAnalyticsAsync(query, cancellationToken));

    [HttpGet("service-demand")]
    public async Task<IActionResult> ServiceDemand([FromQuery] AnalyticsQueryDto query, CancellationToken cancellationToken)
        => Ok(await _analyticsService.GetServiceDemandAnalyticsAsync(query, cancellationToken));
}
