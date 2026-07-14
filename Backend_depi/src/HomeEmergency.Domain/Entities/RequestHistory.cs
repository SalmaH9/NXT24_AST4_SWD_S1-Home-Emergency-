using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HomeEmergency.Domain.Common;

namespace HomeEmergency.Domain.Entities;

public class RequestHistory : BaseEntity
{
    public Guid ServiceRequestId { get; set; }

    public string OldStatus { get; set; } = string.Empty;

    public string NewStatus { get; set; } = string.Empty;

    public string Comment { get; set; } = string.Empty;
    public Guid? ChangedBy { get; set; }

    public ServiceRequest ServiceRequest { get; set; } = null!;
}