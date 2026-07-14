using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.TrackingLocations;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api")]
public class TrackingController : ControllerBase
{
    private readonly ITrackingLocationService _trackingLocationService;
    private readonly ICurrentUserService _currentUserService;

    public TrackingController(
        ITrackingLocationService trackingLocationService,
        ICurrentUserService currentUserService)
    {
        _trackingLocationService = trackingLocationService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Adds a real-time location point to an active service execution.
    /// Only the provider assigned to the execution may add tracking locations.
    /// </summary>
    /// <param name="request">Contains the service execution id, latitude and longitude.</param>
    /// <returns>The saved tracking location record.</returns>
    [HttpPost("tracking")]
    [Authorize(Roles = "Provider,Company")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(TrackingLocationDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddLocation([FromBody] AddTrackingLocationDto request)
    {
        var providerId = _currentUserService.GetRequiredUserId();
        var result = await _trackingLocationService.AddLocationAsync(providerId, request);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves the full location history for a service execution, ordered by
    /// RecordedAt ascending.
    /// </summary>
    /// <param name="executionId">The service execution GUID.</param>
    /// <returns>An ordered list of tracking location records.</returns>
    [HttpGet("service-executions/{executionId:guid}/tracking")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<TrackingLocationDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetByExecution(Guid executionId)
    {
        var locations = await _trackingLocationService.GetLocationsByExecutionAsync(executionId);
        return Ok(locations);
    }
}
