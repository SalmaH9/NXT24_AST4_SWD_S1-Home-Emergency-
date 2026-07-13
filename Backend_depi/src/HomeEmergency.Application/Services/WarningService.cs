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
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.Services;

public class WarningService : IWarningService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;
    private readonly INotificationService _notificationService;

    public WarningService(
        IUnitOfWork unitOfWork,
        UserManager<ApplicationUser> userManager,
        IMapper mapper,
        INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _userManager = userManager;
        _mapper = mapper;
        _notificationService = notificationService;
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
        await _notificationService.CreateAsync(userId, NotificationType.WarningIssued, request.Title, request.Reason,
            NotificationReferenceType.Warning, warning.Id);

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

