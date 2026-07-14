using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.ServiceRequests;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api/service-requests")]
public class ServiceRequestsController : ControllerBase
{
    private readonly IServiceRequestService _serviceRequestService;
    private readonly ICurrentUserService _currentUserService;

    public ServiceRequestsController(
        IServiceRequestService serviceRequestService,
        ICurrentUserService currentUserService)
    {
        _serviceRequestService = serviceRequestService;
        _currentUserService = currentUserService;
    }

    /// <summary>
    /// Creates a new service request for the authenticated customer.
    /// </summary>
    /// <param name="request">The service request details.</param>
    /// <returns>The created service request.</returns>
    [HttpPost]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ServiceRequestDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create([FromBody] CreateServiceRequestDto request)
    {
        var customerId = _currentUserService.GetRequiredUserId();
        var result = await _serviceRequestService.CreateServiceRequestAsync(customerId, request);
        return Ok(result);
    }

    /// <summary>
    /// Retrieves all service requests (admin/provider use).
    /// </summary>
    /// <returns>A list of all service requests.</returns>
    [HttpGet]
    [Authorize(Roles = "Admin,Provider,Company")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ServiceRequestDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAll()
    {
        var requests = await _serviceRequestService.GetAllServiceRequestsAsync();
        return Ok(requests);
    }

    /// <summary>
    /// Retrieves all service requests belonging to the authenticated customer.
    /// </summary>
    /// <returns>The customer's service requests.</returns>
    [HttpGet("my-requests")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(IEnumerable<ServiceRequestDto>))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetMyRequests()
    {
        var customerId = _currentUserService.GetRequiredUserId();
        var requests = await _serviceRequestService.GetCustomerRequestsAsync(customerId);
        return Ok(requests);
    }

    /// <summary>
    /// Retrieves a single service request by its identifier.
    /// </summary>
    /// <param name="id">The service request GUID.</param>
    /// <returns>The service request, or 404 if not found.</returns>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ServiceRequestDto))]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _serviceRequestService.GetServiceRequestByIdAsync(id);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    /// <summary>
    /// Updates an existing service request.
    /// </summary>
    /// <param name="id">The service request GUID.</param>
    /// <param name="request">The updated service request details.</param>
    /// <returns>The updated service request.</returns>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ServiceRequestDto))]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateServiceRequestDto request)
    {
        var result = await _serviceRequestService.UpdateServiceRequestAsync(id, request);
        return Ok(result);
    }

    /// <summary>
    /// Deletes a service request.
    /// </summary>
    /// <param name="id">The service request GUID.</param>
    /// <returns>True if deleted, 404 if not found.</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Customer,Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await _serviceRequestService.DeleteServiceRequestAsync(id);

        if (!deleted)
            return NotFound();

        return Ok();
    }

    /// <summary>
    /// Marks a completed service request as reopened.
    /// </summary>
    /// <param name="id">The service request GUID.</param>
    /// <returns>True if reopened, 404 if not found.</returns>
    [HttpPost("{id:guid}/reopen")]
    [Authorize(Roles = "Customer")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Reopen(Guid id)
    {
        var result = await _serviceRequestService.ReopenRequestAsync(id);

        if (!result)
            return NotFound();

        return Ok();
    }
}
