using System.Threading.Tasks;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace HomeEmergency.API.Hubs;

[Authorize]
public class NotificationHub : Hub
{
    private readonly ICurrentUserService _currentUserService;

    public NotificationHub(ICurrentUserService currentUserService)
    {
        _currentUserService = currentUserService;
    }

    public override async Task OnConnectedAsync()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, GetUserGroupName(_currentUserService.GetRequiredUserId()));
        await base.OnConnectedAsync();
    }

    public static string GetUserGroupName(System.Guid userId) => $"user:{userId}";
}
