using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using HomeEmergency.Application.DTOs.Warnings;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;

namespace HomeEmergency.Application.Services;

public class WarningService : IWarningService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;

    public WarningService(
        IUnitOfWork unitOfWork,
        UserManager<ApplicationUser> userManager,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
        _mapper = mapper;
    }

    public async Task<WarningDto> CreateWarningAsync(Guid userId, Guid adminId, CreateWarningDto request)
    {
        // 1. Verify user exists
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("Target user not found.");
        }

        // 2. Create the warning entity
        var warning = new UserWarning
        {
            UserId = userId,
            IssuedBy = adminId,
            Title = request.Title,
            Reason = request.Reason,
            SeverityLevel = request.SeverityLevel,
            CreatedAt = DateTime.UtcNow
        };

        // 3. Save to database
        await _unitOfWork.UserWarnings.AddAsync(warning);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<WarningDto>(warning);
    }

    public async Task<IEnumerable<WarningDto>> GetUserWarningsAsync(Guid userId)
    {
        // 1. Verify user exists
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("Target user not found.");
        }

        // 2. Fetch warnings
        var warnings = await _unitOfWork.UserWarnings.FindAsync(w => w.UserId == userId);
        
        return _mapper.Map<IEnumerable<WarningDto>>(warnings.OrderByDescending(w => w.CreatedAt));
    }

    public async Task<bool> RemoveWarningAsync(Guid warningId)
    {
        // 1. Find warning
        var warning = await _unitOfWork.UserWarnings.GetByIdAsync(warningId);
        if (warning == null)
        {
            throw new KeyNotFoundException("Warning not found.");
        }

        // 2. Delete warning
        _unitOfWork.UserWarnings.Delete(warning);
        await _unitOfWork.CompleteAsync();

        return true;
    }
}

