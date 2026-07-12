using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HomeEmergency.Application.DTOs.Subscriptions;
using HomeEmergency.Application.Interfaces.Services;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public SubscriptionsController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    /// <summary>
    /// Retrieves all active subscription plans available for purchase.
    /// </summary>
    /// <returns>A list of active plans.</returns>
    [HttpGet]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<SubscriptionPlanDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetActivePlans()
    {
        var plans = await _subscriptionService.GetActivePlansAsync();
        return Ok(plans);
    }

    /// <summary>
    /// Subscribes the currently authenticated user to a specific active subscription plan.
    /// </summary>
    /// <param name="subscriptionId">The GUID identifier of the plan to buy.</param>
    /// <returns>The created user subscription details.</returns>
    [HttpPost("{subscriptionId}/subscribe")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserSubscriptionDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Subscribe(Guid subscriptionId)
    {
        var userId = GetUserId();
        var result = await _subscriptionService.SubscribeUserAsync(userId, subscriptionId);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves the current active or most recently expired subscription of the authenticated user.
    /// </summary>
    /// <returns>The user's subscription metadata, or 204 No Content if none.</returns>
    [HttpGet("my-subscription")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(UserSubscriptionDto))]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMySubscription()
    {
        var userId = GetUserId();
        var subscription = await _subscriptionService.GetUserSubscriptionAsync(userId);
        if (subscription == null)
        {
            return NoContent();
        }
        return Ok(subscription);
    }

    private Guid GetUserId()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                           ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            throw new UnauthorizedAccessException("User is not authenticated.");
        }

        return userId;
    }
}

