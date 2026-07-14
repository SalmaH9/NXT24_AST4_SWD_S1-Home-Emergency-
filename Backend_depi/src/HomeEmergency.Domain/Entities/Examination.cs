using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Domain.Common;

namespace HomeEmergency.Domain.Entities;

public class Examination : BaseEntity
{
    public Guid ServiceRequestId { get; set; }

    public Guid ProviderId { get; set; }

    public string Report { get; set; } = string.Empty;

    public decimal EstimatedPrice { get; set; }

    public bool IsApproved { get; set; }
    public DateTime ExaminedAt { get; set; } = DateTime.UtcNow;

    public ServiceRequest ServiceRequest { get; set; } = null!;

    public ApplicationUser Provider { get; set; } = null!;
}