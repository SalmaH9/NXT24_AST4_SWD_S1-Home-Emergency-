using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.Application.DTOs.ServiceRequests;

public class CreateServiceRequestDto
{
    public Guid CategoryId { get; set; }

    public string Description { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public int RequiredProviders { get; set; } = 1;
}

public class UpdateServiceRequestDto
{
    public string Description { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public int RequiredProviders { get; set; }
}

public class ServiceRequestDto
{
    public Guid Id { get; set; }

    public Guid CustomerId { get; set; }

    public Guid CategoryId { get; set; }

    public Guid? SelectedProviderId { get; set; }

    public string Description { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public int RequiredProviders { get; set; }

    public string Status { get; set; } = string.Empty;

    public bool IsReopened { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}