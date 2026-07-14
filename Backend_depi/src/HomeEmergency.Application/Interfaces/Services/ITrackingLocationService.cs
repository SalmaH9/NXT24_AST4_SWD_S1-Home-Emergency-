using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.TrackingLocations;

namespace HomeEmergency.Application.Interfaces.Services;

public interface ITrackingLocationService
{
    // Provider Actions
    Task<TrackingLocationDto> AddLocationAsync(Guid providerId, AddTrackingLocationDto request);

    // Shared Queries
    Task<IEnumerable<TrackingLocationDto>> GetLocationsByExecutionAsync(Guid serviceExecutionId);
}
