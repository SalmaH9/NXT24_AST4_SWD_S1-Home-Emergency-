using HomeEmergency.Application.DTOs.Ratings;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;
using HomeEmergency.Infrastructure.Persistence;
using HomeEmergency.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace HomeEmergency.Tests;

public class RatingServiceTests
{
    [Fact]
    public async Task CreateAsync_Throws_WhenDuplicateRatingExists()
    {
        var receiverId = Guid.NewGuid();
        await using var context = CreateContext();
        context.Users.Add(new ApplicationUser
        {
            Id = receiverId,
            UserName = "receiver@example.com",
            Email = "receiver@example.com",
            FullName = "Receiver"
        });
        context.Ratings.Add(new Rating
        {
            SenderUserId = Guid.NewGuid(),
            ReceiverUserId = receiverId,
            ServiceRequestId = Guid.NewGuid(),
            RatingStage = RatingStage.ServiceCompletion,
            RatingValue = 4
        });
        await context.SaveChangesAsync();

        var userManager = BuildUserManager();
        userManager.Setup(x => x.FindByIdAsync(receiverId.ToString()))
            .ReturnsAsync((ApplicationUser?)context.Users.First());

        var service = new RatingService(context, userManager.Object);
        var senderId = context.Ratings.Select(x => x.SenderUserId).First();
        var serviceRequestId = context.Ratings.Select(x => x.ServiceRequestId).First();

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            service.CreateAsync(senderId, new CreateRatingRequestDto
            {
                ReceiverUserId = receiverId,
                ServiceRequestId = serviceRequestId,
                RatingStage = RatingStage.ServiceCompletion,
                RatingValue = 5
            }));
    }

    [Fact]
    public async Task CreateAsync_Throws_WhenRatingValueIsOutsideRange()
    {
        var receiverId = Guid.NewGuid();
        await using var context = CreateContext();
        var userManager = BuildUserManager();
        userManager.Setup(x => x.FindByIdAsync(receiverId.ToString()))
            .ReturnsAsync(new ApplicationUser { Id = receiverId, FullName = "Receiver", UserName = "r", Email = "r@test" });

        var service = new RatingService(context, userManager.Object);

        await Assert.ThrowsAsync<ArgumentException>(() =>
            service.CreateAsync(Guid.NewGuid(), new CreateRatingRequestDto
            {
                ReceiverUserId = receiverId,
                RatingValue = 6,
                RatingStage = RatingStage.CustomerExperience
            }));
    }

    private static Mock<UserManager<ApplicationUser>> BuildUserManager()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        return new Mock<UserManager<ApplicationUser>>(store.Object, null!, null!, null!, null!, null!, null!, null!, null!);
    }

    private static ApplicationDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        return new ApplicationDbContext(options);
    }
}
