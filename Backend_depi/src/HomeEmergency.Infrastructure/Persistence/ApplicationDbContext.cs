using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using HomeEmergency.Domain.Entities;

namespace HomeEmergency.Infrastructure.Persistence;

public class ApplicationDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<CustomerProfile> CustomerProfiles { get; set; } = null!;
    public DbSet<ProviderProfile> ProviderProfiles { get; set; } = null!;
    public DbSet<CompanyProfile> CompanyProfiles { get; set; } = null!;
    public DbSet<VerificationDocument> VerificationDocuments { get; set; } = null!;
    public DbSet<Subscription> Subscriptions { get; set; } = null!;
    public DbSet<UserWarning> UserWarnings { get; set; } = null!;
    public DbSet<RefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<SubscriptionPlan> SubscriptionPlans { get; set; } = null!;
    public DbSet<Chat> Chats { get; set; } = null!;
    public DbSet<ChatParticipant> ChatParticipants { get; set; } = null!;
    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<Notification> Notifications { get; set; } = null!;
    public DbSet<Rating> Ratings { get; set; } = null!;
    public DbSet<Advertisement> Advertisements { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<AdvertisementCategory> AdvertisementCategories { get; set; } = null!;
 
    public DbSet<AIConversation> AIConversations { get; set; } = null!;
    public DbSet<AIMessage> AIMessages { get; set; } = null!;
    public DbSet<ServiceRequest> ServiceRequests { get; set; } = null!;

    public DbSet<ProviderOffer> ProviderOffers { get; set; } = null!;

    public DbSet<Examination> Examinations { get; set; } = null!;

    public DbSet<ServiceExecution> ServiceExecutions { get; set; } = null!;

    public DbSet<TrackingLocation> TrackingLocations { get; set; } = null!;

    public DbSet<RequestHistory> RequestHistories { get; set; } = null!;


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Rename standard ASP.NET Core Identity tables
        modelBuilder.Entity<ApplicationUser>().ToTable("Users");
        modelBuilder.Entity<IdentityRole<Guid>>().ToTable("Roles");
        modelBuilder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles");
        modelBuilder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims");
        modelBuilder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins");
        modelBuilder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims");
        modelBuilder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens");

        // Seed Default Roles
        var adminRoleId = Guid.Parse("d6e8a5b2-32a1-43e9-98fd-8b3f6f1c4e72");
        var customerRoleId = Guid.Parse("f2c8d5a1-7b3e-4c28-9844-42ea9e1a1234");
        var providerRoleId = Guid.Parse("8b72f1a3-2c1a-4fde-b56e-8d827f3d4e8c");
        var companyRoleId = Guid.Parse("e3d8f1e5-6b8c-4a3d-be9d-7f8e9a2b3c4d");

        modelBuilder.Entity<IdentityRole<Guid>>().HasData(
            new IdentityRole<Guid> { Id = adminRoleId, Name = "Admin", NormalizedName = "ADMIN" },
            new IdentityRole<Guid> { Id = customerRoleId, Name = "Customer", NormalizedName = "CUSTOMER" },
            new IdentityRole<Guid> { Id = providerRoleId, Name = "Provider", NormalizedName = "PROVIDER" },
            new IdentityRole<Guid> { Id = companyRoleId, Name = "Company", NormalizedName = "COMPANY" }
        );

        // Apply all custom entity configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}

