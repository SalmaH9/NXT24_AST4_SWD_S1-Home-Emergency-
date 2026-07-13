using System;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Application.DTOs.Chats;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api/chats")]
public class ChatsController : ControllerBase
{
    private readonly IChatService _chatService;
    private readonly ICurrentUserService _currentUserService;

    public ChatsController(IChatService chatService, ICurrentUserService currentUserService)
    {
        _chatService = chatService;
        _currentUserService = currentUserService;
    }

    [HttpPost]
    public Task<IActionResult> Create([FromBody] CreateChatRequestDto request, CancellationToken cancellationToken)
        => Execute(async () => Ok(await _chatService.CreateChatAsync(_currentUserService.GetRequiredUserId(), request, cancellationToken)));

    [HttpGet]
    public Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Execute(async () => Ok(await _chatService.GetChatsAsync(_currentUserService.GetRequiredUserId(), pageNumber, pageSize, cancellationToken)));

    [HttpGet("{chatId:guid}")]
    public Task<IActionResult> GetById(Guid chatId, CancellationToken cancellationToken)
        => Execute(async () => Ok(await _chatService.GetChatAsync(_currentUserService.GetRequiredUserId(), chatId, cancellationToken)));

    [HttpGet("{chatId:guid}/messages")]
    public Task<IActionResult> GetMessages(Guid chatId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 50, CancellationToken cancellationToken = default)
        => Execute(async () => Ok(await _chatService.GetMessagesAsync(_currentUserService.GetRequiredUserId(), chatId, pageNumber, pageSize, cancellationToken)));

    [HttpPost("{chatId:guid}/messages")]
    public Task<IActionResult> CreateMessage(Guid chatId, [FromBody] CreateMessageRequestDto request, CancellationToken cancellationToken)
        => Execute(async () => Ok(await _chatService.CreateMessageAsync(_currentUserService.GetRequiredUserId(), chatId, request, cancellationToken)));

    [HttpPut("{chatId:guid}/messages/{messageId:guid}")]
    public Task<IActionResult> UpdateMessage(Guid chatId, Guid messageId, [FromBody] UpdateMessageRequestDto request, CancellationToken cancellationToken)
        => Execute(async () => Ok(await _chatService.UpdateMessageAsync(_currentUserService.GetRequiredUserId(), chatId, messageId, request, cancellationToken)));

    [HttpDelete("{chatId:guid}/messages/{messageId:guid}")]
    public Task<IActionResult> DeleteMessage(Guid chatId, Guid messageId, CancellationToken cancellationToken)
        => Execute(async () =>
        {
            await _chatService.DeleteMessageAsync(_currentUserService.GetRequiredUserId(), chatId, messageId, cancellationToken);
            return NoContent();
        });

    [HttpPost("{chatId:guid}/read")]
    public Task<IActionResult> MarkRead(Guid chatId, CancellationToken cancellationToken)
        => Execute(async () =>
        {
            await _chatService.MarkChatAsReadAsync(_currentUserService.GetRequiredUserId(), chatId, cancellationToken);
            return NoContent();
        });

    private static async Task<IActionResult> Execute(Func<Task<IActionResult>> action)
    {
        return await action();
    }
}
