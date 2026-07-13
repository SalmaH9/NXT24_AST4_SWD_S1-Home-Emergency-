using System;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Advertisements;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/advertisements")]
public class AdminAdvertisementsController : ControllerBase
{
    private readonly IAdvertisementService _advertisementService;
    private readonly ICurrentUserService _currentUserService;

    public AdminAdvertisementsController(IAdvertisementService advertisementService, ICurrentUserService currentUserService)
    {
        _advertisementService = advertisementService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await _advertisementService.GetAdminListAsync(pageNumber, pageSize, cancellationToken));

    [HttpPut("{id:guid}/approve")]
    public async Task<IActionResult> Approve(Guid id, CancellationToken cancellationToken)
        => Ok(await _advertisementService.ApproveAsync(_currentUserService.GetRequiredUserId(), id, cancellationToken));

    [HttpPut("{id:guid}/reject")]
    public async Task<IActionResult> Reject(Guid id, [FromBody] ReviewAdvertisementRequestDto request, CancellationToken cancellationToken)
        => Ok(await _advertisementService.RejectAsync(_currentUserService.GetRequiredUserId(), id, request.Reason ?? "Rejected by admin.", cancellationToken));

    [HttpPut("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, [FromBody] ReviewAdvertisementRequestDto request, CancellationToken cancellationToken)
        => Ok(await _advertisementService.CancelAsync(_currentUserService.GetRequiredUserId(), id, request.Reason, cancellationToken));
}
