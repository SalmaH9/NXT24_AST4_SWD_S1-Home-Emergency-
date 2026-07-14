using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Domain.Common;

namespace HomeEmergency.Domain.Entities;

public class TrackingLocation : BaseEntity
{
    public Guid ServiceExecutionId { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    public ServiceExecution ServiceExecution { get; set; } = null!;
}