using HomeEmergency.Application.DTOs.AI;
using HomeEmergency.Infrastructure.Persistence;
using HomeEmergency.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

namespace HomeEmergency.Tests;

public class AIConversationServiceTests
{
    [Fact]
    public async Task GetByIdAsync_Throws_WhenConversationBelongsToAnotherUser()
    {
        await using var context = CreateContext();
        var ownerId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        context.AIConversations.Add(new HomeEmergency.Domain.Entities.AIConversation
        {
            UserId = ownerId,
            Title = "Secret",
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var service = new AIConversationService(context);
        var conversationId = await context.AIConversations.Select(x => x.Id).FirstAsync();

        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GetByIdAsync(otherUserId, conversationId));
    }

    [Fact]
    public async Task AddMessageAsync_Throws_WhenConversationIsArchived()
    {
        await using var context = CreateContext();
        var userId = Guid.NewGuid();

        context.AIConversations.Add(new HomeEmergency.Domain.Entities.AIConversation
        {
            UserId = userId,
            Title = "Archived",
            IsArchived = true,
            CreatedAt = DateTime.UtcNow
        });
        await context.SaveChangesAsync();

        var service = new AIConversationService(context);
        var conversationId = await context.AIConversations.Select(x => x.Id).FirstAsync();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.AddMessageAsync(userId, conversationId, new AddAIMessageRequestDto
            {
                Role = HomeEmergency.Domain.Enums.AIMessageRole.User,
                Content = "hello"
            }));
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }
}
