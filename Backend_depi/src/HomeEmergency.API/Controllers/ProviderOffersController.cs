using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.ProviderOffers;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api")]
public class ProviderOffersController : ControllerBase
{
    private readonly IProviderOfferService _providerOfferService;
    private readonly ICurrentUserService _currentUserService;

    public ProviderOffersController(
        IProviderOfferService providerOfferService,
        ICurrentUserService currentUserService)
    {
        _providerOfferService = providerOfferService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Submits a price offer for an open service request.
    /// </summary>
    /// <param name="request">The offer details including service request id, price and notes.</param>
    /// <returns>The created provider offer.</returns>
    [HttpPost("provider-offers")]
    [Authorize(Roles = "Provider,Company")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ProviderOfferDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> CreateOffer([FromBody] CreateProviderOfferDto request)
    {
        var providerId = _currentUserService.GetRequiredUserId();
        var result = await _providerOfferService.CreateOfferAsync(providerId, request);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves all offers submitted for a specific service request.
    /// </summary>
    /// <param name="requestId">The service request GUID.</param>
    /// <returns>A list of provider offers for that request.</returns>
    [HttpGet("service-requests/{requestId:guid}/offers")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ProviderOfferDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetOffersByRequest(Guid requestId)
    {
        var offers = await _providerOfferService.GetOffersByRequestAsync(requestId);
        return Ok(offers);
    }

    /// <summary>
    /// Selects a specific provider for a service request, transitioning the
    /// request status to ProviderSelected.
    /// </summary>
    /// <param name="requestId">The service request GUID.</param>
    /// <param name="dto">Contains the provider GUID to select.</param>
    /// <returns>True if selection succeeded, 404 if the request was not found.</returns>
    [HttpPost("service-requests/{requestId:guid}/select-provider")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SelectProvider(Guid requestId, [FromBody] SelectProviderDto dto)
    {
        var result = await _providerOfferService.SelectProviderAsync(requestId, dto.ProviderId);

        if (!result)
            return NotFound();

        return Ok();
    }

    /// <summary>
    /// Retrieves all offers submitted by the authenticated provider.
    /// </summary>
    /// <returns>A list of offers submitted by this provider.</returns>
    [HttpGet("provider-offers/my-offers")]
    [Authorize(Roles = "Provider,Company")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ProviderOfferDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMyOffers()
    {
        var providerId = _currentUserService.GetRequiredUserId();
        var offers = await _providerOfferService.GetProviderOffersAsync(providerId);
        return Ok(offers);
    }

    /// <summary>
    /// Updates a submitted offer.
    /// </summary>
    /// <param name="id">The offer GUID.</param>
    /// <param name="request">The updated price and notes details.</param>
    /// <returns>The updated offer.</returns>
    [HttpPut("provider-offers/{id:guid}")]
    [Authorize(Roles = "Provider,Company")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ProviderOfferDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateOffer(Guid id, [FromBody] UpdateProviderOfferDto request)
    {
        var providerId = _currentUserService.GetRequiredUserId();
        var result = await _providerOfferService.UpdateOfferAsync(providerId, id, request);
        
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Withdraws/Deletes a submitted offer.
    /// </summary>
    /// <param name="id">The offer GUID.</param>
    /// <returns>True if withdrawn successfully.</returns>
    [HttpDelete("provider-offers/{id:guid}")]
    [Authorize(Roles = "Provider,Company")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> WithdrawOffer(Guid id)
    {
        var providerId = _currentUserService.GetRequiredUserId();
        var result = await _providerOfferService.WithdrawOfferAsync(providerId, id);
        
        if (!result)
            return NotFound();

        return Ok();
    }
}
