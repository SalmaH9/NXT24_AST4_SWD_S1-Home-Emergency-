using System;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Chats;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IRealTimeChatDispatcher
{
    Task SendMessageAsync(Guid chatId, MessageDto message);
}
