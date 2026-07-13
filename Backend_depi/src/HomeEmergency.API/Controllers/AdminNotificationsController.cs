using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Notifications;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/admin/notifications")]
public class AdminNotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public AdminNotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateSystemNotificationRequestDto request, CancellationToken cancellationToken)
    {
        var notification = await _notificationService.CreateSystemNotificationAsync(request, cancellationToken);
        return Ok(notification);
    }
}
