using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Examinations;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api")]
public class ExaminationsController : ControllerBase
{
    private readonly IExaminationService _examinationService;
    private readonly ICurrentUserService _currentUserService;

    public ExaminationsController(
        IExaminationService examinationService,
        ICurrentUserService currentUserService)
    {
        _examinationService = examinationService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Submits an examination report for a service request.
    /// Transitions the request status to WaitingCustomerApproval.
    /// </summary>
    /// <param name="request">The examination details including report, estimated price and service request id.</param>
    /// <returns>The created examination record.</returns>
    [HttpPost("examinations")]
    [Authorize(Roles = "Provider,Company")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ExaminationDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Create([FromBody] CreateExaminationDto request)
    {
        var providerId = _currentUserService.GetRequiredUserId();
        var result = await _examinationService.CreateExaminationAsync(providerId, request);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves the examination report associated with a service request.
    /// </summary>
    /// <param name="requestId">The service request GUID.</param>
    /// <returns>The examination record, or 404 if none exists.</returns>
    [HttpGet("service-requests/{requestId:guid}/examination")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ExaminationDto))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetByRequest(Guid requestId)
    {
        var result = await _examinationService.GetExaminationByRequestAsync(requestId);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Retrieves all examinations submitted by the authenticated provider.
    /// </summary>
    /// <returns>A list of examinations for the current provider.</returns>
    [HttpGet("examinations/my-examinations")]
    [Authorize(Roles = "Provider,Company")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ExaminationDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMyExaminations()
    {
        var providerId = _currentUserService.GetRequiredUserId();
        var results = await _examinationService.GetExaminationsByProviderAsync(providerId);
        return Ok(results);
    }

    /// <summary>
    /// Approves or rejects an examination report submitted by the provider.
    /// </summary>
    /// <param name="examinationId">The examination GUID.</param>
    /// <param name="request">Contains IsApproved flag.</param>
    /// <returns>True if the operation succeeded.</returns>
    [HttpPut("examinations/{examinationId:guid}/approve")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Approve(Guid examinationId, [FromBody] ApproveExaminationDto request)
    {
        var customerId = _currentUserService.GetRequiredUserId();
        var result = await _examinationService.ApproveExaminationAsync(customerId, examinationId, request);
        return Ok(result);
    }
}
