using System;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Profiles;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IUserService
{
    Task<UserProfileDto> GetUserProfileAsync(Guid userId);
    Task<UserCompleteInfoDto> GetUserCompleteInfoAsync(Guid userId);
    Task<bool> UpdateUserProfileAsync(Guid userId, UpdateProfileRequestDto request);
}

