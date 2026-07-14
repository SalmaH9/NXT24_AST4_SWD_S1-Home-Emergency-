using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Application.DTOs.ServiceRequests;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IServiceRequestService
{
    Task<ServiceRequestDto> CreateServiceRequestAsync(Guid customerId, CreateServiceRequestDto request);

    Task<ServiceRequestDto> UpdateServiceRequestAsync(Guid id, UpdateServiceRequestDto request);

    Task<bool> DeleteServiceRequestAsync(Guid id);

    Task<IEnumerable<ServiceRequestDto>> GetAllServiceRequestsAsync();

    Task<ServiceRequestDto?> GetServiceRequestByIdAsync(Guid id);

    Task<IEnumerable<ServiceRequestDto>> GetCustomerRequestsAsync(Guid customerId);

    Task<bool> ReopenRequestAsync(Guid id);
}