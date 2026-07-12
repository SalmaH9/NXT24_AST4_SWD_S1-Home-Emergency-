using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HomeEmergency.Application.DTOs.Warnings;
using HomeEmergency.Application.Interfaces.Services;

namespace HomeEmergency.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/users")]
public class AdminWarningsController : ControllerBase
{
    private readonly IWarningService _warningService;

    public AdminWarningsController(IWarningService warningService)
    {
        _warningService = warningService;
    }

    /// <summary>
    /// Issues a formal compliance warning to a specific user on the platform.
    /// </summary>
    /// <param name="userId">The GUID identifier of the target user.</param>
    /// <param name="request">Warning parameters including title, reason, and severity.</param>
    /// <returns>The created warning details.</returns>
    [HttpPost("{userId}/warnings")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(WarningDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateWarning(Guid userId, [FromBody] CreateWarningDto request)
    {
        var adminId = GetAdminUserId();
        var warningDto = await _warningService.CreateWarningAsync(userId, adminId, request);
        return Ok(warningDto);
    }

    /// <summary>
    /// Retrieves the warning logs issued to a specific user.
    /// </summary>
    /// <param name="userId">The GUID identifier of the target user.</param>
    /// <returns>A list of warnings issued to the user.</returns>
    [HttpGet("{userId}/warnings")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<WarningDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserWarnings(Guid userId)
    {
        var warnings = await _warningService.GetUserWarningsAsync(userId);
        return Ok(warnings);
    }

    /// <summary>
    /// Removes/retracts a specific warning from a user's logs.
    /// </summary>
    /// <param name="warningId">The GUID identifier of the target warning record.</param>
    /// <returns>True if deletion succeeds.</returns>
    [HttpDelete("warnings/{warningId}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RemoveWarning(Guid warningId)
    {
        var result = await _warningService.RemoveWarningAsync(warningId);
        return Ok(result);
    }

    private Guid GetAdminUserId()
    {
        var adminIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                            ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(adminIdString) || !Guid.TryParse(adminIdString, out var adminId))
        {
            throw new UnauthorizedAccessException("Administrator is not authenticated.");
        }

        return adminId;
    }
}

