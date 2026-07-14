using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Domain.Common;

namespace HomeEmergency.Domain.Entities;

public class ProviderOffer : BaseEntity
{
    public Guid ServiceRequestId { get; set; }

    public Guid ProviderId { get; set; }

    public decimal Price { get; set; }

    public string Notes { get; set; } = string.Empty;

    public bool IsAccepted { get; set; }

    public ServiceRequest ServiceRequest { get; set; } = null!;

    public ApplicationUser Provider { get; set; } = null!;
}