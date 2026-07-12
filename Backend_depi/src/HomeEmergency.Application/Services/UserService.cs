using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using HomeEmergency.Application.DTOs.Profiles;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;

namespace HomeEmergency.Application.Services;

public class UserService : IUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public UserService(
        UserManager<ApplicationUser> userManager,
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _userManager = userManager;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<UserProfileDto> GetUserProfileAsync(Guid userId)
    {
        // 1. Fetch user by Id
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("User not found.");
        }

        // 2. Fetch roles assigned to the user
        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Customer";

        // 3. Map user entity to UserProfileDto
        var userProfileDto = _mapper.Map<UserProfileDto>(user);
        userProfileDto.Role = primaryRole;

        // 4. Attach role-specific sub-profiles
        if (primaryRole == "Customer")
        {
            var profile = await _unitOfWork.CustomerProfiles.GetByIdAsync(userId);
            if (profile != null)
            {
                userProfileDto.CustomerProfile = _mapper.Map<CustomerProfileDto>(profile);
            }
        }
        else if (primaryRole == "Provider")
        {
            var profile = await _unitOfWork.ProviderProfiles.GetByIdAsync(userId);
            if (profile != null)
            {
                userProfileDto.ProviderProfile = _mapper.Map<ProviderProfileDto>(profile);
            }
        }
        else if (primaryRole == "Company")
        {
            var profile = await _unitOfWork.CompanyProfiles.GetByIdAsync(userId);
            if (profile != null)
            {
                userProfileDto.CompanyProfile = _mapper.Map<CompanyProfileDto>(profile);
            }
        }

        return userProfileDto;
    }

    public async Task<UserCompleteInfoDto> GetUserCompleteInfoAsync(Guid userId)
    {
        // 1. Fetch user by Id
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("User not found.");
        }

        // 2. Fetch roles
        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Customer";

        // 3. Map user to complete info DTO
        var completeDto = _mapper.Map<UserCompleteInfoDto>(user);
        completeDto.Role = primaryRole;

        // 4. Attach sub-profiles
        if (primaryRole == "Customer")
        {
            var profile = await _unitOfWork.CustomerProfiles.GetByIdAsync(userId);
            if (profile != null)
            {
                completeDto.CustomerProfile = _mapper.Map<CustomerProfileDto>(profile);
            }
        }
        else if (primaryRole == "Provider")
        {
            var profile = await _unitOfWork.ProviderProfiles.GetByIdAsync(userId);
            if (profile != null)
            {
                completeDto.ProviderProfile = _mapper.Map<ProviderProfileDto>(profile);
            }
        }
        else if (primaryRole == "Company")
        {
            var profile = await _unitOfWork.CompanyProfiles.GetByIdAsync(userId);
            if (profile != null)
            {
                completeDto.CompanyProfile = _mapper.Map<CompanyProfileDto>(profile);
            }
        }

        return completeDto;
    }

    public async Task<bool> UpdateUserProfileAsync(Guid userId, UpdateProfileRequestDto request)
    {
        // 1. Fetch user by Id
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("User not found.");
        }

        // 2. Update allowed user-level fields
        user.FullName = request.FullName;
        user.PhoneNumber = request.PhoneNumber;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to update core user details: {errors}");
        }

        // 3. Determine role to apply specific changes
        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Customer";

        // 4. Update the corresponding sub-profile fields
        if (primaryRole == "Customer")
        {
            var profile = await _unitOfWork.CustomerProfiles.GetByIdAsync(userId);
            if (profile != null)
            {
                profile.PreferredLanguage = request.PreferredLanguage ?? profile.PreferredLanguage;
                profile.DefaultAddress = request.DefaultAddress ?? profile.DefaultAddress;
                profile.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.CustomerProfiles.Update(profile);
            }
        }
        else if (primaryRole == "Provider")
        {
            var profile = await _unitOfWork.ProviderProfiles.GetByIdAsync(userId);
            if (profile != null)
            {
                profile.Bio = request.Bio ?? profile.Bio;
                profile.ServiceCategory = request.ServiceCategory ?? profile.ServiceCategory;
                profile.ServiceRadiusKm = request.ServiceRadiusKm ?? profile.ServiceRadiusKm;
                profile.AvailabilityStatus = request.AvailabilityStatus ?? profile.AvailabilityStatus;
                profile.ExperienceYears = request.ExperienceYears ?? profile.ExperienceYears;
                profile.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.ProviderProfiles.Update(profile);
            }
        }
        else if (primaryRole == "Company")
        {
            var profile = await _unitOfWork.CompanyProfiles.GetByIdAsync(userId);
            if (profile != null)
            {
                profile.CompanyName = request.CompanyName ?? profile.CompanyName;
                profile.RegistrationNumber = request.RegistrationNumber ?? profile.RegistrationNumber;
                profile.WebsiteUrl = request.WebsiteUrl ?? profile.WebsiteUrl;
                profile.Bio = request.Bio ?? profile.Bio;
                profile.EmployeeCount = request.EmployeeCount ?? profile.EmployeeCount;
                profile.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.CompanyProfiles.Update(profile);
            }
        }

        // Commit sub-profile modifications inside transaction boundary
        await _unitOfWork.CompleteAsync();

        return true;
    }
}

