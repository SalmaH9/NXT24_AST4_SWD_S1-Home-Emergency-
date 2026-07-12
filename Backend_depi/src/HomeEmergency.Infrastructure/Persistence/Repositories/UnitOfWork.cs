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

