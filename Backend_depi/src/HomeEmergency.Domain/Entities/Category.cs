using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


using HomeEmergency.Domain.Common;

namespace HomeEmergency.Domain.Entities;

public class Category : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public ICollection<ServiceRequest> ServiceRequests { get; set; } = new List<ServiceRequest>();
}