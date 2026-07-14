using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using AutoMapper;
using HomeEmergency.Application.DTOs.TrackingLocations;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;

namespace HomeEmergency.Application.Services;

public class TrackingLocationService : ITrackingLocationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TrackingLocationService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TrackingLocationDto> AddLocationAsync(Guid providerId, AddTrackingLocationDto request)
    {
        var execution = await _unitOfWork.ServiceExecutions.GetByIdAsync(request.ServiceExecutionId);

        if (execution == null)
            throw new KeyNotFoundException("Service execution not found.");

        // Resolve the associated service request to verify the provider
        var serviceRequest = await _unitOfWork.ServiceRequests.GetByIdAsync(execution.ServiceRequestId);

        if (serviceRequest == null)
            throw new KeyNotFoundException("Associated service request not found.");

        // Only the provider assigned to this execution may add tracking locations
        if (serviceRequest.SelectedProviderId != providerId)
            throw new InvalidOperationException("Only the assigned provider can add tracking locations for this execution.");

        var location = new TrackingLocation
        {
            ServiceExecutionId = request.ServiceExecutionId,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            RecordedAt = DateTime.UtcNow
        };

        await _unitOfWork.TrackingLocations.AddAsync(location);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<TrackingLocationDto>(location);
    }

    public async Task<IEnumerable<TrackingLocationDto>> GetLocationsByExecutionAsync(Guid serviceExecutionId)
    {
        var locations = await _unitOfWork.TrackingLocations.FindAsync(
            x => x.ServiceExecutionId == serviceExecutionId);

        return _mapper.Map<IEnumerable<TrackingLocationDto>>(
            locations.OrderBy(x => x.RecordedAt));
    }
}
