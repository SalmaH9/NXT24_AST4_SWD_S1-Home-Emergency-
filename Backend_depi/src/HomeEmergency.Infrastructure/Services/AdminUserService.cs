using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.DTOs.Profiles;
using HomeEmergency.Application.DTOs.Verification;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;
using HomeEmergency.Infrastructure.Persistence;

namespace HomeEmergency.Infrastructure.Services;

public class AdminUserService : IAdminUserService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly INotificationService _notificationService;

    public AdminUserService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole<Guid>> roleManager,
        ApplicationDbContext context,
        IUnitOfWork unitOfWork,
        IMapper mapper,
        INotificationService notificationService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationService = notificationService;
    }

    public async Task<PaginatedListDto<AdminUserSummaryDto>> GetUsersAsync(int pageNumber, int pageSize)
    {
        var query = _userManager.Users.Where(u => !u.IsDeleted);

        var totalCount = await query.CountAsync();
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var summaryDtos = new List<AdminUserSummaryDto>();
        foreach (var user in items)
        {
            var dto = _mapper.Map<AdminUserSummaryDto>(user);
            var roles = await _userManager.GetRolesAsync(user);
            dto.Role = roles.FirstOrDefault() ?? "Customer";
            dto.IsVerified = await CheckIsVerifiedAsync(user, dto.Role);
            summaryDtos.Add(dto);
        }

        return new PaginatedListDto<AdminUserSummaryDto>(summaryDtos, totalCount, pageNumber, pageSize);
    }

    public async Task<AdminUserDetailDto> GetUserByIdAsync(Guid id)
    {
        var user = await _userManager.Users
            .Include(u => u.SubmittedDocuments)
            .FirstOrDefaultAsync(u => u.Id == id && !u.IsDeleted);

        if (user == null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Customer";

        var detailDto = _mapper.Map<AdminUserDetailDto>(user);
        detailDto.Role = primaryRole;
        detailDto.IsVerified = await CheckIsVerifiedAsync(user, primaryRole);

        // Map role-specific sub-profiles
        if (primaryRole == "Customer")
        {
            var profile = await _unitOfWork.CustomerProfiles.GetByIdAsync(id);
            if (profile != null)
            {
                detailDto.CustomerProfile = _mapper.Map<CustomerProfileDto>(profile);
            }
        }
        else if (primaryRole == "Provider")
        {
            var profile = await _unitOfWork.ProviderProfiles.GetByIdAsync(id);
            if (profile != null)
            {
                detailDto.ProviderProfile = _mapper.Map<ProviderProfileDto>(profile);
            }
        }
        else if (primaryRole == "Company")
        {
            var profile = await _unitOfWork.CompanyProfiles.GetByIdAsync(id);
            if (profile != null)
            {
                detailDto.CompanyProfile = _mapper.Map<CompanyProfileDto>(profile);
            }
        }

        return detailDto;
    }

    public async Task<PaginatedListDto<AdminUserSummaryDto>> SearchUsersAsync(UserSearchFilterDto filter)
    {
        var query = _userManager.Users.Where(u => !u.IsDeleted);

        // 1. Filter by search term (FullName or Email)
        if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
        {
            var term = filter.SearchTerm.ToLower();
            query = query.Where(u => u.FullName.ToLower().Contains(term) || u.Email.ToLower().Contains(term));
        }

        // 2. Filter by Account Status
        if (!string.IsNullOrWhiteSpace(filter.StatusFilter))
        {
            if (Enum.TryParse<AccountStatus>(filter.StatusFilter, true, out var status))
            {
                query = query.Where(u => u.Status == status);
            }
        }

        // 3. Filter by Role (using SQL join on Identity UserRoles table)
        if (!string.IsNullOrWhiteSpace(filter.RoleFilter))
        {
            var role = await _roleManager.FindByNameAsync(filter.RoleFilter);
            if (role != null)
            {
                var userIdsInRole = _context.UserRoles
                    .Where(ur => ur.RoleId == role.Id)
                    .Select(ur => ur.UserId);

                query = query.Where(u => userIdsInRole.Contains(u.Id));
            }
        }

        // 4. Apply Sorting
        var sortColumn = filter.SortBy;
        var desc = filter.SortDescending;

        if (sortColumn == "FullName")
        {
            query = desc ? query.OrderByDescending(u => u.FullName) : query.OrderBy(u => u.FullName);
        }
        else if (sortColumn == "Email")
        {
            query = desc ? query.OrderByDescending(u => u.Email) : query.OrderBy(u => u.Email);
        }
        else if (sortColumn == "Status")
        {
            query = desc ? query.OrderByDescending(u => u.Status) : query.OrderBy(u => u.Status);
        }
        else // Default CreatedAt
        {
            query = desc ? query.OrderByDescending(u => u.CreatedAt) : query.OrderBy(u => u.CreatedAt);
        }

        // 5. Apply Pagination
        var totalCount = await query.CountAsync();
        var items = await query
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        var summaryDtos = new List<AdminUserSummaryDto>();
        foreach (var user in items)
        {
            var dto = _mapper.Map<AdminUserSummaryDto>(user);
            var roles = await _userManager.GetRolesAsync(user);
            dto.Role = roles.FirstOrDefault() ?? "Customer";
            dto.IsVerified = await CheckIsVerifiedAsync(user, dto.Role);
            summaryDtos.Add(dto);
        }

        return new PaginatedListDto<AdminUserSummaryDto>(summaryDtos, totalCount, filter.PageNumber, filter.PageSize);
    }

    private async Task<bool> CheckIsVerifiedAsync(ApplicationUser user, string role)
    {
        if (role == "Customer")
        {
            return user.Status == AccountStatus.Active;
        }

        // Providers or Companies are verified if they possess at least one Approved document
        var docs = await _unitOfWork.VerificationDocuments.FindAsync(
            d => d.UserId == user.Id && d.Status == DocumentStatus.Approved);

        return docs.Any();
    }

    public async Task<bool> SuspendUserAsync(Guid userId, Guid adminId, SuspendUserRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("User not found.");
        }

        user.Status = AccountStatus.Suspended;
        user.SuspensionReason = request.Reason;
        user.SuspendedAt = DateTime.UtcNow;
        user.SuspendedBy = adminId;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to suspend user: {errors}");
        }

        // Invalidate active refresh tokens for the user to force immediate logout
        var activeTokens = await _unitOfWork.RefreshTokens.FindAsync(
            r => r.UserId == userId && r.RevokedAt == null && r.ExpiresAt > DateTime.UtcNow);

        foreach (var token in activeTokens)
        {
            token.RevokedAt = DateTime.UtcNow;
            token.RevokedByIp = "0.0.0.0";
        }

        await _unitOfWork.CompleteAsync();
        await _notificationService.CreateAsync(userId, NotificationType.AccountSuspended,
            "Account suspended", request.Reason, NotificationReferenceType.User, userId);

        return true;
    }

    public async Task<bool> UnsuspendUserAsync(Guid userId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("User not found.");
        }

        user.Status = AccountStatus.Active;
        user.SuspensionReason = null;
        user.SuspendedAt = null;
        user.SuspendedBy = null;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(" ", result.Errors.Select(e => e.Description));
            throw new InvalidOperationException($"Failed to unsuspend user: {errors}");
        }

        return true;
    }
}

