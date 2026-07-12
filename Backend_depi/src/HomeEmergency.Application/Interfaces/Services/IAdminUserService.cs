using System;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IAdminUserService
{
    Task<PaginatedListDto<AdminUserSummaryDto>> GetUsersAsync(int pageNumber, int pageSize);
    Task<AdminUserDetailDto> GetUserByIdAsync(Guid id);
    Task<PaginatedListDto<AdminUserSummaryDto>> SearchUsersAsync(UserSearchFilterDto filter);
    Task<bool> SuspendUserAsync(Guid userId, Guid adminId, SuspendUserRequestDto request);
    Task<bool> UnsuspendUserAsync(Guid userId);
}

