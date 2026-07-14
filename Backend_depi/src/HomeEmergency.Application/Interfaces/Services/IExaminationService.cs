using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Examinations;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IExaminationService
{
    // Provider Actions
    Task<ExaminationDto> CreateExaminationAsync(Guid providerId, CreateExaminationDto request);

    // Customer Actions
    Task<bool> ApproveExaminationAsync(Guid customerId, Guid examinationId, ApproveExaminationDto request);

    // Shared Queries
    Task<ExaminationDto?> GetExaminationByRequestAsync(Guid serviceRequestId);

    Task<IEnumerable<ExaminationDto>> GetExaminationsByProviderAsync(Guid providerId);
}
