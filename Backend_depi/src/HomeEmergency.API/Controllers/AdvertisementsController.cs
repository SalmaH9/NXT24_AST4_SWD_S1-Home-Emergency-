using System;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Advertisements;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api/advertisements")]
public class AdvertisementsController : ControllerBase
{
    private readonly IAdvertisementService _advertisementService;
    private readonly ICurrentUserService _currentUserService;

    public AdvertisementsController(IAdvertisementService advertisementService, ICurrentUserService currentUserService)
    {
        _advertisementService = advertisementService;
        _currentUserService = currentUserService;
    }

    [Authorize(Roles = "Company")]
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Create([FromForm] CreateAdvertisementRequestDto request, IFormFile? media, CancellationToken cancellationToken)
    {
        using var stream = media?.OpenReadStream();
        var result = await _advertisementService.CreateAsync(_currentUserService.GetRequiredUserId(), request, stream, media?.FileName, cancellationToken);
        return Ok(result);
    }

    [Authorize(Roles = "Company")]
    [HttpGet("my")]
    public async Task<IActionResult> GetMy([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await _advertisementService.GetMyAdvertisementsAsync(_currentUserService.GetRequiredUserId(), pageNumber, pageSize, cancellationToken));

    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var userId = _currentUserService.UserId ?? Guid.Empty;
        var isAdmin = _currentUserService.IsInRole("Admin");
        return Ok(await _advertisementService.GetByIdAsync(userId, id, isAdmin, cancellationToken));
    }

    [Authorize(Roles = "Company")]
    [HttpPut("{id:guid}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Update(Guid id, [FromForm] UpdateAdvertisementRequestDto request, IFormFile? media, CancellationToken cancellationToken)
    {
        using var stream = media?.OpenReadStream();
        return Ok(await _advertisementService.UpdateAsync(_currentUserService.GetRequiredUserId(), id, request, stream, media?.FileName, cancellationToken));
    }

    [Authorize(Roles = "Company")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await _advertisementService.DeleteAsync(_currentUserService.GetRequiredUserId(), id, cancellationToken);
        return NoContent();
    }

    [Authorize(Roles = "Company")]
    [HttpPost("{id:guid}/submit")]
    public async Task<IActionResult> Submit(Guid id, CancellationToken cancellationToken)
    {
        await _advertisementService.SubmitAsync(_currentUserService.GetRequiredUserId(), id, cancellationToken);
        return NoContent();
    }

    [AllowAnonymous]
    [HttpGet("active")]
    public async Task<IActionResult> Active([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await _advertisementService.GetActiveAsync(pageNumber, pageSize, cancellationToken));

    [AllowAnonymous]
    [HttpGet("category/{categoryId:guid}")]
    public async Task<IActionResult> ByCategory(Guid categoryId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await _advertisementService.GetByCategoryAsync(categoryId, pageNumber, pageSize, cancellationToken));
}
