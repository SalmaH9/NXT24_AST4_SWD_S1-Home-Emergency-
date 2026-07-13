using HomeEmergency.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeEmergency.Infrastructure.Persistence.Configurations;

public class ChatConfiguration : IEntityTypeConfiguration<Chat>
{
    public void Configure(EntityTypeBuilder<Chat> builder)
    {
        builder.ToTable("Chats");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.ChatType).IsRequired();
        builder.HasIndex(x => new { x.ServiceRequestId, x.ChatType, x.IsActive });
    }
}

public class ChatParticipantConfiguration : IEntityTypeConfiguration<ChatParticipant>
{
    public void Configure(EntityTypeBuilder<ChatParticipant> builder)
    {
        builder.ToTable("ChatParticipants");
        builder.HasKey(x => x.Id);
        builder.HasIndex(x => new { x.ChatId, x.UserId }).IsUnique();

        builder.HasOne(x => x.Chat)
            .WithMany(x => x.Participants)
            .HasForeignKey(x => x.ChatId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.User)
            .WithMany(x => x.ChatParticipants)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class MessageConfiguration : IEntityTypeConfiguration<Message>
{
    public void Configure(EntityTypeBuilder<Message> builder)
    {
        builder.ToTable("Messages");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Content).IsRequired().HasMaxLength(4000);
        builder.HasIndex(x => new { x.ChatId, x.SentAt });
        builder.HasIndex(x => new { x.ChatId, x.IsDeleted });

        builder.HasOne(x => x.Chat)
            .WithMany(x => x.Messages)
            .HasForeignKey(x => x.ChatId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Sender)
            .WithMany(x => x.SentMessages)
            .HasForeignKey(x => x.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> builder)
    {
        builder.ToTable("Notifications");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Body).IsRequired().HasMaxLength(2000);
        builder.HasIndex(x => new { x.UserId, x.CreatedAt });
        builder.HasIndex(x => new { x.UserId, x.IsRead });

        builder.HasOne(x => x.User)
            .WithMany(x => x.Notifications)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class RatingConfiguration : IEntityTypeConfiguration<Rating>
{
    public void Configure(EntityTypeBuilder<Rating> builder)
    {
        builder.ToTable("Ratings");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Comment).HasMaxLength(1000);
        builder.HasIndex(x => new { x.ReceiverUserId, x.CreatedAt });
        builder.HasIndex(x => new { x.SenderUserId, x.ReceiverUserId, x.ServiceRequestId, x.ServiceExecutionId, x.RatingStage })
            .IsUnique();
        builder.ToTable(t => t.HasCheckConstraint("CK_Ratings_RatingValue", "[RatingValue] BETWEEN 1 AND 5"));

        builder.HasOne(x => x.SenderUser)
            .WithMany(x => x.RatingsGiven)
            .HasForeignKey(x => x.SenderUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ReceiverUser)
            .WithMany(x => x.RatingsReceived)
            .HasForeignKey(x => x.ReceiverUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Provider)
            .WithMany(x => x.Ratings)
            .HasForeignKey(x => x.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AdvertisementConfiguration : IEntityTypeConfiguration<Advertisement>
{
    public void Configure(EntityTypeBuilder<Advertisement> builder)
    {
        builder.ToTable("Advertisements");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.ImagePath).HasMaxLength(512);
        builder.Property(x => x.RejectionReason).HasMaxLength(1000);
        builder.HasIndex(x => new { x.Status, x.StartDate, x.EndDate });
        builder.ToTable(t => t.HasCheckConstraint("CK_Advertisements_DateRange", "[StartDate] <= [EndDate]"));

        builder.HasOne(x => x.CompanyUser)
            .WithMany(x => x.Advertisements)
            .HasForeignKey(x => x.CompanyUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AdvertisementCategoryConfiguration : IEntityTypeConfiguration<AdvertisementCategory>
{
    public void Configure(EntityTypeBuilder<AdvertisementCategory> builder)
    {
        builder.ToTable("AdvertisementCategories");
        builder.HasKey(x => new { x.AdvertisementId, x.ServiceCategoryId });
        builder.HasIndex(x => x.ServiceCategoryId);

        builder.HasOne(x => x.Advertisement)
            .WithMany(x => x.Categories)
            .HasForeignKey(x => x.AdvertisementId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}

public class AIConversationConfiguration : IEntityTypeConfiguration<AIConversation>
{
    public void Configure(EntityTypeBuilder<AIConversation> builder)
    {
        builder.ToTable("AIConversations");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Title).IsRequired().HasMaxLength(200);
        builder.HasIndex(x => new { x.UserId, x.CreatedAt });
        builder.HasIndex(x => new { x.UserId, x.IsArchived });

        builder.HasOne(x => x.User)
            .WithMany(x => x.AIConversations)
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}

public class AIMessageConfiguration : IEntityTypeConfiguration<AIMessage>
{
    public void Configure(EntityTypeBuilder<AIMessage> builder)
    {
        builder.ToTable("AIMessages");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Content).IsRequired().HasMaxLength(4000);
        builder.Property(x => x.MetadataJson).HasMaxLength(4000);
        builder.HasIndex(x => new { x.ConversationId, x.CreatedAt });

        builder.HasOne(x => x.Conversation)
            .WithMany(x => x.Messages)
            .HasForeignKey(x => x.ConversationId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
