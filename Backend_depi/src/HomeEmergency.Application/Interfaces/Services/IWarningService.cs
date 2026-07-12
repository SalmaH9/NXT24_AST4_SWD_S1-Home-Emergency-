using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Warnings;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IWarningService
{
    Task<WarningDto> CreateWarningAsync(Guid userId, Guid adminId, CreateWarningDto request);
    Task<IEnumerable<WarningDto>> GetUserWarningsAsync(Guid userId);
    Task<bool> RemoveWarningAsync(Guid warningId);
}

