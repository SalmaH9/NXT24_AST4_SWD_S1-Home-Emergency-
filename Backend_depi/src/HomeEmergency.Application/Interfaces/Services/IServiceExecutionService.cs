using System;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.ServiceExecutions;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IServiceExecutionService
{
    // Provider Actions
    Task<ServiceExecutionDto> StartExecutionAsync(Guid providerId, StartServiceExecutionDto request);

    Task<ServiceExecutionDto> CompleteExecutionAsync(Guid providerId, CompleteServiceExecutionDto request);

    // Shared Queries
    Task<ServiceExecutionDto?> GetExecutionByRequestAsync(Guid serviceRequestId);

    Task<ServiceExecutionDto?> GetExecutionByIdAsync(Guid executionId);
}
