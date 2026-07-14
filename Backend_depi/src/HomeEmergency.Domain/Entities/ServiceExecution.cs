using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Domain.Common;

namespace HomeEmergency.Domain.Entities;

public class ServiceExecution : BaseEntity
{
    public Guid ServiceRequestId { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? FinishedAt { get; set; }

    public bool IsCompleted { get; set; }

    public ServiceRequest ServiceRequest { get; set; } = null!;

    public ICollection<TrackingLocation> TrackingLocations { get; set; } = new List<TrackingLocation>();
}