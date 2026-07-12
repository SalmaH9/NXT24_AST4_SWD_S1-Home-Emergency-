using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Subscriptions;

namespace HomeEmergency.Application.Interfaces.Services;

public interface ISubscriptionService
{
    // Admin Actions
    Task<SubscriptionPlanDto> CreatePlanAsync(CreateSubscriptionPlanDto request);
    Task<SubscriptionPlanDto> UpdatePlanAsync(Guid id, UpdateSubscriptionPlanDto request);
    Task<bool> DeletePlanAsync(Guid id); // Soft delete (IsActive = false / IsDeleted = true)

    // User Actions
    Task<IEnumerable<SubscriptionPlanDto>> GetActivePlansAsync();
    Task<UserSubscriptionDto> SubscribeUserAsync(Guid userId, Guid planId);
    Task<UserSubscriptionDto?> GetUserSubscriptionAsync(Guid userId);
}

