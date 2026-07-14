using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.DTOs.Notifications;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;
using HomeEmergency.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HomeEmergency.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly ApplicationDbContext _context;
    private readonly IRealTimeNotificationDispatcher _realTimeNotificationDispatcher;

    public NotificationService(
        ApplicationDbContext context,
        IRealTimeNotificationDispatcher realTimeNotificationDispatcher)
    {
        _context = context;
        _realTimeNotificationDispatcher = realTimeNotificationDispatcher;
    }

    public async Task<NotificationDto> CreateAsync(
        Guid userId,
        NotificationType type,
        string title,
        string body,
        NotificationReferenceType referenceType = NotificationReferenceType.None,
        Guid? referenceId = null,
        CancellationToken cancellationToken = default)
    {
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Body = body,
            ReferenceType = referenceType,
            ReferenceId = referenceId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);

        var dto = Map(notification);
        await _realTimeNotificationDispatcher.SendNotificationAsync(userId, dto);

        return dto;
    }

    public async Task<PaginatedListDto<NotificationDto>> GetForUserAsync(Guid userId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Notifications
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);
        var notifications = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
        var items = notifications.Select(Map).ToList();

        return new PaginatedListDto<NotificationDto>(items, totalCount, pageNumber, pageSize);
    }

    public Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return _context.Notifications.CountAsync(x => x.UserId == userId && !x.IsRead, cancellationToken);
    }

    public async Task MarkAsReadAsync(Guid userId, Guid notificationId, CancellationToken cancellationToken = default)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(x => x.Id == notificationId && x.UserId == userId, cancellationToken);

        if (notification == null)
        {
            throw new KeyNotFoundException("Notification not found.");
        }

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            notification.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public async Task MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var notifications = await _context.Notifications
            .Where(x => x.UserId == userId && !x.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            notification.UpdatedAt = DateTime.UtcNow;
        }

        if (notifications.Count > 0)
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    public Task<NotificationDto> CreateSystemNotificationAsync(CreateSystemNotificationRequestDto request, CancellationToken cancellationToken = default)
    {
        return CreateAsync(request.UserId, NotificationType.System, request.Title, request.Body, request.ReferenceType,
            request.ReferenceId, cancellationToken);
    }

    private static NotificationDto Map(Notification notification)
    {
        return new NotificationDto
        {
            Id = notification.Id,
            Type = notification.Type,
            Title = notification.Title,
            Body = notification.Body,
            ReferenceType = notification.ReferenceType,
            ReferenceId = notification.ReferenceId,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            ReadAt = notification.ReadAt
        };
    }
}
