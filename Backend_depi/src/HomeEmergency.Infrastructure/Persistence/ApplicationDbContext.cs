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

        modelBuilder.Entity<Category>().HasData(
            new Category { Id = Guid.Parse("d2b512c8-8df3-4c91-a123-5e926ab4d1ef"), Name = "Plumbing", Description = "Plumbing repairs, leaks, blocks, and piping emergencies." },
            new Category { Id = Guid.Parse("e7c81a5f-9bf4-4d82-b234-6f937bc5d2f0"), Name = "Electrical", Description = "Short circuits, wiring issues, power cuts, and electrical emergencies." },
            new Category { Id = Guid.Parse("f8d92b6a-0cf5-4e93-c345-7fa48cd6e3a1"), Name = "AC Repair", Description = "Air conditioning fixes, cooling issues, and gas refilling." },
            new Category { Id = Guid.Parse("a9e03c7b-1df6-4f04-d456-8fa59de7f4b2"), Name = "Carpentry", Description = "Door, window, locks, and furniture repair services." },
            new Category { Id = Guid.Parse("b0f14d8c-2df7-4f15-e567-9fa60ef8f5c3"), Name = "Painting", Description = "Wall painting, touch-ups, and water damage cover-ups." },
            new Category { Id = Guid.Parse("c1f25e9d-3df8-4f26-f678-0fa71f09f6d4"), Name = "Masonry", Description = "Wall repairs, tiles fixes, cement, and concrete touch-ups." },
            new Category { Id = Guid.Parse("d2f36f0e-4df9-4f37-a789-1fa82f1af7e5"), Name = "Cleaning", Description = "Emergency home cleaning, post-leak cleanups, and sanitization." },
            new Category { Id = Guid.Parse("e3f47a1f-5df0-4f48-b890-2fa93f2bf8f6"), Name = "Gardening", Description = "Trimming, yard maintenance, and outdoor cleanups." },
            new Category { Id = Guid.Parse("f4f58b20-6df1-4f59-c901-3faa4f3cf9f7"), Name = "Appliance Repair", Description = "Oven, fridge, washing machine, and stove emergency fixes." },
            new Category { Id = Guid.Parse("05f69c31-7df2-4f60-da12-4fba5f4df0f8"), Name = "Pest Control", Description = "Bugs, insects, and rodents elimination services." },
            new Category { Id = Guid.Parse("16f7ad42-8df3-4f71-eb23-5fca6f5e01f9"), Name = "Other", Description = "Any other emergency maintenance services." }
        );

        // Apply all custom entity configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}

