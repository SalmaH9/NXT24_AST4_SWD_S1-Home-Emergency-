using System;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.ServiceExecutions;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api")]
public class ServiceExecutionsController : ControllerBase
{
    private readonly IServiceExecutionService _serviceExecutionService;
    private readonly ICurrentUserService _currentUserService;

    public ServiceExecutionsController(
        IServiceExecutionService serviceExecutionService,
        ICurrentUserService currentUserService)
    {
        _serviceExecutionService = serviceExecutionService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Starts execution for a service request.
    /// The calling provider must be the selected provider for the request.
    /// Transitions the request status to InProgress.
    /// </summary>
    /// <param name="request">Contains the service request id to start execution for.</param>
    /// <returns>The created service execution record.</returns>
    [HttpPost("service-executions/start")]
    [Authorize(Roles = "Provider,Company")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ServiceExecutionDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Start([FromBody] StartServiceExecutionDto request)
    {
        var providerId = _currentUserService.GetRequiredUserId();
        var result = await _serviceExecutionService.StartExecutionAsync(providerId, request);
        return Ok(result);
    }

    /// <summary>
    /// Completes an active service execution.
    /// The calling provider must be the selected provider for the associated request.
    /// Transitions the request status to Completed.
    /// </summary>
    /// <param name="request">Contains the service execution id to complete.</param>
    /// <returns>The updated service execution record.</returns>
    [HttpPost("service-executions/complete")]
    [Authorize(Roles = "Provider,Company")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ServiceExecutionDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Complete([FromBody] CompleteServiceExecutionDto request)
    {
        var providerId = _currentUserService.GetRequiredUserId();
        var result = await _serviceExecutionService.CompleteExecutionAsync(providerId, request);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves the execution record for a specific service request.
    /// </summary>
    /// <param name="requestId">The service request GUID.</param>
    /// <returns>The service execution record, or 404 if none exists.</returns>
    [HttpGet("service-requests/{requestId:guid}/execution")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ServiceExecutionDto))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByRequest(Guid requestId)
    {
        var result = await _serviceExecutionService.GetExecutionByRequestAsync(requestId);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Retrieves a service execution by its identifier.
    /// </summary>
    /// <param name="id">The service execution GUID.</param>
    /// <returns>The service execution record, or 404 if not found.</returns>
    [HttpGet("service-executions/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ServiceExecutionDto))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _serviceExecutionService.GetExecutionByIdAsync(id);

        if (result == null)
            return NotFound();

        return Ok(result);
    }
}
