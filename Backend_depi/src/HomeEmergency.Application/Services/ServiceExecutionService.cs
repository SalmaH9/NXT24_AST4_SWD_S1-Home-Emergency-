using System;
using System.Linq;
using System.Threading.Tasks;

using AutoMapper;
using HomeEmergency.Application.DTOs.ServiceExecutions;
using HomeEmergency.Application.Helpers;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.Services;

public class ServiceExecutionService : IServiceExecutionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ServiceExecutionService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ServiceExecutionDto> StartExecutionAsync(Guid providerId, StartServiceExecutionDto request)
    {
        var serviceRequest = await _unitOfWork.ServiceRequests.GetByIdAsync(request.ServiceRequestId);

        if (serviceRequest == null)
            throw new KeyNotFoundException("Service request not found.");

        // Only the selected provider may start execution
        if (serviceRequest.SelectedProviderId != providerId)
            throw new InvalidOperationException("Only the selected provider can start execution for this request.");

        // Execution is allowed from ProviderSelected or WaitingCustomerApproval (examination approved)
        if (serviceRequest.Status != ServiceRequestStatus.ProviderSelected &&
            serviceRequest.Status != ServiceRequestStatus.WaitingCustomerApproval)
        {
            throw new InvalidOperationException(
                "Execution can only be started when the request status is ProviderSelected or WaitingCustomerApproval.");
        }

        // Prevent duplicate executions for the same request
        var existing = await _unitOfWork.ServiceExecutions.FindAsync(
            x => x.ServiceRequestId == request.ServiceRequestId);

        if (existing.Any())
            throw new InvalidOperationException("An execution record already exists for this service request.");

        // Capture old status before mutation
        var oldStatus = serviceRequest.Status.ToString();

        var execution = new ServiceExecution
        {
            ServiceRequestId = request.ServiceRequestId,
            StartedAt = DateTime.UtcNow,
            IsCompleted = false
        };

        // Transition the request to InProgress
        serviceRequest.Status = ServiceRequestStatus.InProgress;

        await _unitOfWork.ServiceExecutions.AddAsync(execution);
        _unitOfWork.ServiceRequests.Update(serviceRequest);

        // Record status transition atomically with the execution insert
        await RequestHistoryHelper.RecordAsync(
            _unitOfWork,
            request.ServiceRequestId,
            oldStatus: oldStatus,
            newStatus: ServiceRequestStatus.InProgress.ToString(),
            comment: "Service execution started by provider.",
            changedBy: providerId);

        await _unitOfWork.CompleteAsync();

        return _mapper.Map<ServiceExecutionDto>(execution);
    }

    public async Task<ServiceExecutionDto> CompleteExecutionAsync(Guid providerId, CompleteServiceExecutionDto request)
    {
        var execution = await _unitOfWork.ServiceExecutions.GetByIdAsync(request.ServiceExecutionId);

        if (execution == null)
            throw new KeyNotFoundException("Service execution not found.");

        if (execution.IsCompleted)
            throw new InvalidOperationException("This execution has already been completed.");

        var serviceRequest = await _unitOfWork.ServiceRequests.GetByIdAsync(execution.ServiceRequestId);

        if (serviceRequest == null)
            throw new KeyNotFoundException("Associated service request not found.");

        // Only the selected provider may complete the execution
        if (serviceRequest.SelectedProviderId != providerId)
            throw new InvalidOperationException("Only the selected provider can complete this execution.");

        if (serviceRequest.Status != ServiceRequestStatus.InProgress)
            throw new InvalidOperationException("Execution can only be completed when the request is InProgress.");

        // Capture old status before mutation
        var oldStatus = serviceRequest.Status.ToString();

        // Mark execution as finished
        execution.FinishedAt = DateTime.UtcNow;
        execution.IsCompleted = true;

        // Transition the request to Completed
        serviceRequest.Status = ServiceRequestStatus.Completed;

        _unitOfWork.ServiceExecutions.Update(execution);
        _unitOfWork.ServiceRequests.Update(serviceRequest);

        // Record status transition atomically with the execution update
        await RequestHistoryHelper.RecordAsync(
            _unitOfWork,
            serviceRequest.Id,
            oldStatus: oldStatus,
            newStatus: ServiceRequestStatus.Completed.ToString(),
            comment: "Service execution completed by provider.",
            changedBy: providerId);

        await _unitOfWork.CompleteAsync();

        return _mapper.Map<ServiceExecutionDto>(execution);
    }

    public async Task<ServiceExecutionDto?> GetExecutionByRequestAsync(Guid serviceRequestId)
    {
        var results = await _unitOfWork.ServiceExecutions.FindAsync(
            x => x.ServiceRequestId == serviceRequestId);

        var execution = results.FirstOrDefault();

        if (execution == null)
            return null;

        return _mapper.Map<ServiceExecutionDto>(execution);
    }

    public async Task<ServiceExecutionDto?> GetExecutionByIdAsync(Guid executionId)
    {
        var execution = await _unitOfWork.ServiceExecutions.GetByIdAsync(executionId);

        if (execution == null)
            return null;

        return _mapper.Map<ServiceExecutionDto>(execution);
    }
}
