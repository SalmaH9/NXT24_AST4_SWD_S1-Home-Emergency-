using System;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.DTOs.Notifications;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.Interfaces.Services;

public interface INotificationService
{
    Task<NotificationDto> CreateAsync(Guid userId, NotificationType type, string title, string body,
        NotificationReferenceType referenceType = NotificationReferenceType.None, Guid? referenceId = null,
        CancellationToken cancellationToken = default);

    Task<PaginatedListDto<NotificationDto>> GetForUserAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);
    Task MarkAsReadAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default);
    Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<NotificationDto> CreateSystemNotificationAsync(CreateSystemNotificationRequestDto request, CancellationToken cancellationToken = default);
}
