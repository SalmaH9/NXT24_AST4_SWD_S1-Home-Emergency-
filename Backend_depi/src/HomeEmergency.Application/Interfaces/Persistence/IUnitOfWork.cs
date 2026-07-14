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
    IGenericRepository<Category> Categories { get; }
    IGenericRepository<ServiceRequest> ServiceRequests { get; }

    IGenericRepository<ProviderOffer> ProviderOffers { get; }

    IGenericRepository<Examination> Examinations { get; }

    IGenericRepository<ServiceExecution> ServiceExecutions { get; }

    IGenericRepository<TrackingLocation> TrackingLocations { get; }

    IGenericRepository<RequestHistory> RequestHistories { get; }
    Task<int> CompleteAsync();
}

