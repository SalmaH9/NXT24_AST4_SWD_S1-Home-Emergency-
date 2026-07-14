using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using HomeEmergency.Application.DTOs.ServiceRequests;
using HomeEmergency.Application.Helpers;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.Services;

public class ServiceRequestService : IServiceRequestService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ServiceRequestService(
        IUnitOfWork unitOfWork,
        IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ServiceRequestDto> CreateServiceRequestAsync(
        Guid customerId,
        CreateServiceRequestDto request)
    {
        var entity = _mapper.Map<ServiceRequest>(request);

        entity.CustomerId = customerId;

        await _unitOfWork.ServiceRequests.AddAsync(entity);

        // Record initial status transition: created as Pending
        await RequestHistoryHelper.RecordAsync(
            _unitOfWork,
            entity.Id,
            oldStatus: string.Empty,
            newStatus: ServiceRequestStatus.Pending.ToString(),
            comment: "Service request created.",
            changedBy: customerId);

        await _unitOfWork.CompleteAsync();

        return _mapper.Map<ServiceRequestDto>(entity);
    }

    public async Task<IEnumerable<ServiceRequestDto>> GetAllServiceRequestsAsync()
    {
        var requests = await _unitOfWork.ServiceRequests.GetAllAsync();

        return _mapper.Map<IEnumerable<ServiceRequestDto>>(requests);
    }

    public async Task<ServiceRequestDto?> GetServiceRequestByIdAsync(Guid id)
    {
        var entity = await _unitOfWork.ServiceRequests.GetByIdAsync(id);

        if (entity == null)
            return null;

        return _mapper.Map<ServiceRequestDto>(entity);
    }

    public async Task<IEnumerable<ServiceRequestDto>> GetCustomerRequestsAsync(Guid customerId)
    {
        var requests = await _unitOfWork.ServiceRequests.FindAsync(x => x.CustomerId == customerId);

        return _mapper.Map<IEnumerable<ServiceRequestDto>>(requests);
    }

    public async Task<ServiceRequestDto> UpdateServiceRequestAsync(Guid id, UpdateServiceRequestDto request)
    {
        var entity = await _unitOfWork.ServiceRequests.GetByIdAsync(id);

        if (entity == null)
            throw new KeyNotFoundException("Service request not found.");

        _mapper.Map(request, entity);

        _unitOfWork.ServiceRequests.Update(entity);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<ServiceRequestDto>(entity);
    }

    public async Task<bool> DeleteServiceRequestAsync(Guid id)
    {
        var entity = await _unitOfWork.ServiceRequests.GetByIdAsync(id);

        if (entity == null)
            return false;

        _unitOfWork.ServiceRequests.Delete(entity);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<bool> ReopenRequestAsync(Guid id)
    {
        var entity = await _unitOfWork.ServiceRequests.GetByIdAsync(id);

        if (entity == null)
            return false;

        entity.IsReopened = true;

        _unitOfWork.ServiceRequests.Update(entity);
        await _unitOfWork.CompleteAsync();

        return true;
    }
}