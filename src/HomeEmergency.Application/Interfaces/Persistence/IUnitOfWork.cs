using System;
using System.Threading.Tasks;
using HomeEmergency.Domain.Entities;

namespace HomeEmergency.Application.Interfaces.Persistence;

public interface IUnitOfWork : IDisposable
{
    IGenericRepository<CustomerProfile> CustomerProfiles { get; }
    IGenericRepository<ProviderProfile> ProviderProfiles { get; }
    IGenericRepository<CompanyProfile> CompanyProfiles { get; }
    IGenericRepository<VerificationDocument> VerificationDocuments { get; }
    IGenericRepository<Subscription> Subscriptions { get; }
    IGenericRepository<UserWarning> UserWarnings { get; }
    IGenericRepository<RefreshToken> RefreshTokens { get; }
    IGenericRepository<SubscriptionPlan> SubscriptionPlans { get; }
    Task<int> CompleteAsync();
}

