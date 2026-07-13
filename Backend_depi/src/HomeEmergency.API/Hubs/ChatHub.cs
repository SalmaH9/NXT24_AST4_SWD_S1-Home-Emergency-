using System;
using System.Threading.Tasks;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace HomeEmergency.API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly ICurrentUserService _currentUserService;
    private readonly IChatService _chatService;

    public ChatHub(ICurrentUserService currentUserService, IChatService chatService)
    {
        _currentUserService = currentUserService;
        _chatService = chatService;
    }

    public async Task JoinChat(Guid chatId)
    {
        var userId = _currentUserService.GetRequiredUserId();
        if (!await _chatService.CanJoinChatAsync(userId, chatId))
        {
            throw new HubException("Unauthorized chat access.");
        }

        await Groups.AddToGroupAsync(Context.ConnectionId, GetChatGroupName(chatId));
    }

    public Task LeaveChat(Guid chatId)
    {
        return Groups.RemoveFromGroupAsync(Context.ConnectionId, GetChatGroupName(chatId));
    }

    public static string GetChatGroupName(Guid chatId) => $"chat:{chatId}";
}
