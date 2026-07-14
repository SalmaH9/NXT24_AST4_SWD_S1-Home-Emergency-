using System;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Notifications;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IRealTimeNotificationDispatcher
{
    Task SendNotificationAsync(Guid userId, NotificationDto notification);
}
