using System;

namespace HomeEmergency.Application.Interfaces.Services;

public interface ICurrentUserService
{
    bool IsAuthenticated { get; }
    Guid? UserId { get; }
    Guid GetRequiredUserId();
    bool IsInRole(string role);
}
