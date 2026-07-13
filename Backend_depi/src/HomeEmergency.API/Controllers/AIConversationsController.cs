using System;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.AI;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HomeEmergency.API.Controllers;

[Authorize]
[ApiController]
[Route("api/ai-conversations")]
public class AIConversationsController : ControllerBase
{
    private readonly IAIConversationService _conversationService;
    private readonly ICurrentUserService _currentUserService;

    public AIConversationsController(IAIConversationService conversationService, ICurrentUserService currentUserService)
    {
        _conversationService = conversationService;
        _currentUserService = currentUserService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAIConversationRequestDto request, CancellationToken cancellationToken)
        => Ok(await _conversationService.CreateAsync(_currentUserService.GetRequiredUserId(), request, cancellationToken));

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
        => Ok(await _conversationService.GetForUserAsync(_currentUserService.GetRequiredUserId(), pageNumber, pageSize, cancellationToken));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
        => Ok(await _conversationService.GetByIdAsync(_currentUserService.GetRequiredUserId(), id, cancellationToken));

    [HttpPost("{id:guid}/messages")]
    public async Task<IActionResult> AddMessage(Guid id, [FromBody] AddAIMessageRequestDto request, CancellationToken cancellationToken)
        => Ok(await _conversationService.AddMessageAsync(_currentUserService.GetRequiredUserId(), id, request, cancellationToken));

    [HttpPut("{id:guid}/archive")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
    {
        await _conversationService.ArchiveAsync(_currentUserService.GetRequiredUserId(), id, cancellationToken);
        return NoContent();
    }
}
