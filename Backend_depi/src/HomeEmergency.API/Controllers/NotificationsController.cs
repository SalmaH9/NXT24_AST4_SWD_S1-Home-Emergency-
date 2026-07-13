using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Application.DTOs.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api/notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly ICurrentUserService _currentUserService;

    public NotificationsController(INotificationService notificationService, ICurrentUserService currentUserService)
    {
        _notificationService = notificationService;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Execute(async () => Ok(await _notificationService.GetForUserAsync(_currentUserService.GetRequiredUserId(), pageNumber, pageSize, cancellationToken)));

    [HttpGet("unread-count")]
    public Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken)
        => Execute(async () => Ok(await _notificationService.GetUnreadCountAsync(_currentUserService.GetRequiredUserId(), cancellationToken)));

    [HttpPut("{id:guid}/read")]
    public Task<IActionResult> MarkRead(Guid id, CancellationToken cancellationToken)
        => Execute(async () =>
        {
            await _notificationService.MarkAsReadAsync(_currentUserService.GetRequiredUserId(), id, cancellationToken);
            return NoContent();
        });

    [HttpPut("read-all")]
    public Task<IActionResult> MarkAllRead(CancellationToken cancellationToken)
        => Execute(async () =>
        {
            await _notificationService.MarkAllAsReadAsync(_currentUserService.GetRequiredUserId(), cancellationToken);
            return NoContent();
        });

    private static async Task<IActionResult> Execute(Func<Task<IActionResult>> action)
    {
        return await action();
    }
}
