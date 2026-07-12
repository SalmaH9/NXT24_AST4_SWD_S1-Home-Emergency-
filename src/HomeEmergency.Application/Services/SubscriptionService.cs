using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HomeEmergency.Application.DTOs.Subscriptions;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;

namespace HomeEmergency.Application.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public SubscriptionService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<SubscriptionPlanDto> CreatePlanAsync(CreateSubscriptionPlanDto request)
    {
        var plan = _mapper.Map<SubscriptionPlan>(request);
        
        await _unitOfWork.SubscriptionPlans.AddAsync(plan);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<SubscriptionPlanDto>(plan);
    }

    public async Task<SubscriptionPlanDto> UpdatePlanAsync(Guid id, UpdateSubscriptionPlanDto request)
    {
        var plan = await _unitOfWork.SubscriptionPlans.GetByIdAsync(id);
        if (plan == null || plan.IsDeleted)
        {
            throw new KeyNotFoundException("Subscription plan not found.");
        }

        _mapper.Map(request, plan);
        _unitOfWork.SubscriptionPlans.Update(plan);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<SubscriptionPlanDto>(plan);
    }

    public async Task<bool> DeletePlanAsync(Guid id)
    {
        var plan = await _unitOfWork.SubscriptionPlans.GetByIdAsync(id);
        if (plan == null || plan.IsDeleted)
        {
            throw new KeyNotFoundException("Subscription plan not found.");
        }

        // Soft delete / deactivate
        plan.IsActive = false;
        plan.IsDeleted = true;

        _unitOfWork.SubscriptionPlans.Update(plan);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<IEnumerable<SubscriptionPlanDto>> GetActivePlansAsync()
    {
        var plans = await _unitOfWork.SubscriptionPlans.FindAsync(p => p.IsActive && !p.IsDeleted);
        return _mapper.Map<IEnumerable<SubscriptionPlanDto>>(plans.OrderBy(p => p.Price));
    }

    public async Task<UserSubscriptionDto> SubscribeUserAsync(Guid userId, Guid planId)
    {
        // 1. Get and verify the plan
        var plan = await _unitOfWork.SubscriptionPlans.GetByIdAsync(planId);
        if (plan == null || !plan.IsActive || plan.IsDeleted)
        {
            throw new InvalidOperationException("Target subscription plan is not active or does not exist.");
        }

        // 2. Query user subscriptions and evaluate expirations
        var subs = await _unitOfWork.Subscriptions.FindAsync(s => s.UserId == userId);
        
        foreach (var sub in subs)
        {
            if (sub.Status == "Active" && sub.EndDate <= DateTime.UtcNow)
            {
                sub.Status = "Expired";
                _unitOfWork.Subscriptions.Update(sub);
            }
        }
        await _unitOfWork.CompleteAsync();

        // 3. Verify coexistence rule: User cannot have more than one active subscription
        var activeSub = subs.FirstOrDefault(s => s.Status == "Active");
        if (activeSub != null)
        {
            throw new InvalidOperationException("You already have an active subscription and cannot buy another until it expires.");
        }

        // 4. Create new subscription
        var newSub = new Subscription
        {
            UserId = userId,
            SubscriptionPlanId = planId,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddDays(plan.DurationInDays),
            Status = "Active",
            PricePaid = plan.Price,
            PaymentReference = "SUB-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper()
        };

        await _unitOfWork.Subscriptions.AddAsync(newSub);
        await _unitOfWork.CompleteAsync();

        newSub.SubscriptionPlan = plan; // Load details for mapping
        return _mapper.Map<UserSubscriptionDto>(newSub);
    }

    public async Task<UserSubscriptionDto?> GetUserSubscriptionAsync(Guid userId)
    {
        var subs = await _unitOfWork.Subscriptions.FindAsync(s => s.UserId == userId);
        Subscription? activeSub = null;

        // Evaluate expirations on the fly
        foreach (var sub in subs)
        {
            if (sub.Status == "Active" && sub.EndDate <= DateTime.UtcNow)
            {
                sub.Status = "Expired";
                _unitOfWork.Subscriptions.Update(sub);
            }
            else if (sub.Status == "Active")
            {
                activeSub = sub;
            }
        }
        await _unitOfWork.CompleteAsync();

        if (activeSub != null)
        {
            activeSub.SubscriptionPlan = await _unitOfWork.SubscriptionPlans.GetByIdAsync(activeSub.SubscriptionPlanId);
            return _mapper.Map<UserSubscriptionDto>(activeSub);
        }

        // If no active subscription exists, return the user's most recent expired subscription
        var latestExpired = subs.OrderByDescending(s => s.EndDate).FirstOrDefault();
        if (latestExpired != null)
        {
            latestExpired.SubscriptionPlan = await _unitOfWork.SubscriptionPlans.GetByIdAsync(latestExpired.SubscriptionPlanId);
            return _mapper.Map<UserSubscriptionDto>(latestExpired);
        }

        return null;
    }
}

