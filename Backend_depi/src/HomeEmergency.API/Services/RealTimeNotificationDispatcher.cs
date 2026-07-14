using System;
using System.Threading.Tasks;
using HomeEmergency.API.Hubs;
using HomeEmergency.Application.DTOs.Notifications;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.SignalR;

namespace HomeEmergency.API.Services;

public class RealTimeNotificationDispatcher : IRealTimeNotificationDispatcher
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public RealTimeNotificationDispatcher(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationAsync(Guid userId, NotificationDto notification)
    {
        var groupName = NotificationHub.GetUserGroupName(userId);
        await _hubContext.Clients.Group(groupName).SendAsync("ReceiveNotification", notification);
    }
}
