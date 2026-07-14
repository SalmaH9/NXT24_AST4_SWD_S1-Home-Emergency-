using System;
using System.Threading.Tasks;
using HomeEmergency.API.Hubs;
using HomeEmergency.Application.DTOs.Chats;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.SignalR;

namespace HomeEmergency.API.Services;

public class RealTimeChatDispatcher : IRealTimeChatDispatcher
{
    private readonly IHubContext<ChatHub> _hubContext;

    public RealTimeChatDispatcher(IHubContext<ChatHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendMessageAsync(Guid chatId, MessageDto message)
    {
        var groupName = ChatHub.GetChatGroupName(chatId);
        await _hubContext.Clients.Group(groupName).SendAsync("ReceiveMessage", message);
    }
}
