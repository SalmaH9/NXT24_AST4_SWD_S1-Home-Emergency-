using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HomeEmergency.Application.DTOs.Subscriptions;
using HomeEmergency.Application.Interfaces.Services;

namespace HomeEmergency.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/subscriptions")]
public class AdminSubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subscriptionService;

    public AdminSubscriptionsController(ISubscriptionService subscriptionService)
    {
        _subscriptionService = subscriptionService;
    }

    /// <summary>
    /// Creates a new subscription plan (Admin only).
    /// </summary>
    /// <param name="request">Plan parameters including name, price, and duration.</param>
    /// <returns>The created plan details.</returns>
    [HttpPost]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SubscriptionPlanDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreatePlan([FromBody] CreateSubscriptionPlanDto request)
    {
        var planDto = await _subscriptionService.CreatePlanAsync(request);
        return Ok(planDto);
    }

    /// <summary>
    /// Updates properties of an existing subscription plan (Admin only).
    /// </summary>
    /// <param name="id">The GUID identifier of the plan.</param>
    /// <param name="request">Updated plan parameters.</param>
    /// <returns>The updated plan details.</returns>
    [HttpPut("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(SubscriptionPlanDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdatePlan(Guid id, [FromBody] UpdateSubscriptionPlanDto request)
    {
        var planDto = await _subscriptionService.UpdatePlanAsync(id, request);
        return Ok(planDto);
    }

    /// <summary>
    /// Soft deletes/deactivates a subscription plan, preventing new users from subscribing (Admin only).
    /// </summary>
    /// <param name="id">The GUID identifier of the plan to deactivate.</param>
    /// <returns>True if deactivation succeeds.</returns>
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(bool))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeletePlan(Guid id)
    {
        var result = await _subscriptionService.DeletePlanAsync(id);
        return Ok(result);
    }
}

