using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HomeEmergency.Application.DTOs.Profiles;
using HomeEmergency.Application.Interfaces.Services;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ICurrentUserService _currentUserService;

    public ProfileController(IUserService userService, ICurrentUserService currentUserService)
    {
        _userService = userService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Retrieves the profile details of the currently authenticated user.
    /// </summary>
    /// <returns>General user and role-specific profile details.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserProfileDto))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetProfile()
    {
        var userId = _currentUserService.GetRequiredUserId();
        var profile = await _userService.GetUserProfileAsync(userId);
        return Ok(profile);
    }

    /// <summary>
    /// Retrieves the complete user metadata and profile statistics of the currently authenticated user.
    /// </summary>
    /// <returns>User configuration and profile payload.</returns>
    [HttpGet("me")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserCompleteInfoDto))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetCompleteInfo()
    {
        var userId = _currentUserService.GetRequiredUserId();
        var info = await _userService.GetUserCompleteInfoAsync(userId);
        return Ok(info);
    }

    /// <summary>
    /// Updates the editable profile details for the currently authenticated user.
    /// </summary>
    /// <param name="request">Updated profile payload.</param>
    /// <returns>True if the update is successful.</returns>
    [HttpPut]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request)
    {
        var userId = _currentUserService.GetRequiredUserId();
        var result = await _userService.UpdateUserProfileAsync(userId, request);
        return Ok(result);
    }
}

