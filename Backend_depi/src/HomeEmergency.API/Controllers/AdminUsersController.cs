using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.Interfaces.Services;

namespace HomeEmergency.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/users")]
public class AdminUsersController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminUsersController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    /// <summary>
    /// Retrieves a paginated list of all non-deleted users in the system.
    /// </summary>
    /// <param name="pageNumber">The target page index (starts at 1).</param>
    /// <param name="pageSize">The number of users per page (default 10).</param>
    /// <returns>A paginated list of user summaries.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PaginatedListDto<AdminUserSummaryDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
    {
        var result = await _adminUserService.GetUsersAsync(pageNumber, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves complete details of a specific user including lockout settings, documents list, and sub-profile properties.
    /// </summary>
    /// <param name="id">The GUID identifier of the user.</param>
    /// <returns>A complete user detail payload.</returns>
    [HttpGet("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(AdminUserDetailDto))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var result = await _adminUserService.GetUserByIdAsync(id);
        return Ok(result);
    }

    /// <summary>
    /// Searches and filters users based on Name, Email, Role, and Status, supporting custom sorting and pagination.
    /// </summary>
    /// <param name="filter">Filter, sort, and pagination criteria.</param>
    /// <returns>A paginated list of matching user summaries.</returns>
    [HttpGet("search")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(PaginatedListDto<AdminUserSummaryDto>))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> SearchUsers([FromQuery] UserSearchFilterDto filter)
    {
        var result = await _adminUserService.SearchUsersAsync(filter);
        return Ok(result);
    }

    /// <summary>
    /// Administratively suspends a user account and invalidates all their active refresh tokens.
    /// </summary>
    /// <param name="userId">The GUID identifier of the user to suspend.</param>
    /// <param name="request">The suspension reason parameters.</param>
    /// <returns>True if the suspension succeeds.</returns>
    [HttpPut("{userId}/suspend")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SuspendUser(Guid userId, [FromBody] SuspendUserRequestDto request)
    {
        var adminId = GetAdminUserId();
        var result = await _adminUserService.SuspendUserAsync(userId, adminId, request);
        return Ok(result);
    }

    /// <summary>
    /// Administratively unsuspends a user account, returning their status to Active.
    /// </summary>
    /// <param name="userId">The GUID identifier of the user to unsuspend.</param>
    /// <returns>True if the unsuspension succeeds.</returns>
    [HttpPut("{userId}/unsuspend")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UnsuspendUser(Guid userId)
    {
        var result = await _adminUserService.UnsuspendUserAsync(userId);
        return Ok(result);
    }

    private Guid GetAdminUserId()
    {
        var adminIdString = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value 
                            ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(adminIdString) || !Guid.TryParse(adminIdString, out var adminId))
        {
            throw new UnauthorizedAccessException("Administrator is not authenticated.");
        }

        return adminId;
    }
}

