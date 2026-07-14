using System;
using System.Threading.Tasks;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Domain.Entities;

namespace HomeEmergency.Infrastructure.Persistence.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public IGenericRepository<CustomerProfile> CustomerProfiles { get; }
    public IGenericRepository<ProviderProfile> ProviderProfiles { get; }
    public IGenericRepository<CompanyProfile> CompanyProfiles { get; }
    public IGenericRepository<VerificationDocument> VerificationDocuments { get; }
    public IGenericRepository<Subscription> Subscriptions { get; }
    public IGenericRepository<UserWarning> UserWarnings { get; }
    public IGenericRepository<RefreshToken> RefreshTokens { get; }
    public IGenericRepository<SubscriptionPlan> SubscriptionPlans { get; }
    public IGenericRepository<Category> Categories { get; }
    public IGenericRepository<ServiceRequest> ServiceRequests { get; }

    public IGenericRepository<ProviderOffer> ProviderOffers { get; }

    public IGenericRepository<Examination> Examinations { get; }

    public IGenericRepository<ServiceExecution> ServiceExecutions { get; }

    public IGenericRepository<TrackingLocation> TrackingLocations { get; }

    public IGenericRepository<RequestHistory> RequestHistories { get; }

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;
        CustomerProfiles = new GenericRepository<CustomerProfile>(_context);
        ProviderProfiles = new GenericRepository<ProviderProfile>(_context);
        CompanyProfiles = new GenericRepository<CompanyProfile>(_context);
        VerificationDocuments = new GenericRepository<VerificationDocument>(_context);
        Subscriptions = new GenericRepository<Subscription>(_context);
        UserWarnings = new GenericRepository<UserWarning>(_context);
        RefreshTokens = new GenericRepository<RefreshToken>(_context);
        SubscriptionPlans = new GenericRepository<SubscriptionPlan>(_context);
        Categories = new GenericRepository<Category>(_context);
        ServiceRequests = new GenericRepository<ServiceRequest>(_context);

        ProviderOffers = new GenericRepository<ProviderOffer>(_context);

        Examinations = new GenericRepository<Examination>(_context);

        ServiceExecutions = new GenericRepository<ServiceExecution>(_context);

        TrackingLocations = new GenericRepository<TrackingLocation>(_context);

        RequestHistories = new GenericRepository<RequestHistory>(_context);
    }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
        GC.SuppressFinalize(this);
    }
}

