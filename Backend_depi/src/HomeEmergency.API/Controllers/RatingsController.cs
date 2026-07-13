using System;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Ratings;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api")]
public class RatingsController : ControllerBase
{
    private readonly IRatingService _ratingService;
    private readonly ICurrentUserService _currentUserService;

    public RatingsController(IRatingService ratingService, ICurrentUserService currentUserService)
    {
        _ratingService = ratingService;
        _currentUserService = currentUserService;
    }

    [HttpPost("ratings")]
    public async Task<IActionResult> Create([FromBody] CreateRatingRequestDto request, CancellationToken cancellationToken)
        => Ok(await _ratingService.CreateAsync(_currentUserService.GetRequiredUserId(), request, cancellationToken));

    [HttpGet("ratings/received")]
    public async Task<IActionResult> GetReceived([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await _ratingService.GetReceivedAsync(_currentUserService.GetRequiredUserId(), pageNumber, pageSize, cancellationToken));

    [HttpGet("ratings/given")]
    public async Task<IActionResult> GetGiven([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await _ratingService.GetGivenAsync(_currentUserService.GetRequiredUserId(), pageNumber, pageSize, cancellationToken));

    [HttpGet("providers/{providerId:guid}/ratings")]
    public async Task<IActionResult> GetProviderRatings(Guid providerId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await _ratingService.GetProviderRatingsAsync(providerId, pageNumber, pageSize, cancellationToken));

    [HttpGet("users/{userId:guid}/rating-summary")]
    public async Task<IActionResult> GetSummary(Guid userId, CancellationToken cancellationToken)
        => Ok(await _ratingService.GetUserSummaryAsync(userId, cancellationToken));
}
