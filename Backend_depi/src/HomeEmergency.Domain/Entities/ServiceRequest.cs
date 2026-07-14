using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HomeEmergency.Domain.Common;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Domain.Entities;

public class ServiceRequest : BaseEntity
{
    public Guid CustomerId { get; set; }

    public Guid CategoryId { get; set; }
    public Guid? SelectedProviderId { get; set; }
    public string Description { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public int RequiredProviders { get; set; } = 1;

    public bool IsReopened { get; set; }

    public ServiceRequestStatus Status { get; set; } = ServiceRequestStatus.Pending;

    public ApplicationUser Customer { get; set; } = null!;

    public ApplicationUser? SelectedProvider { get; set; }

    public Category Category { get; set; } = null!;

    public ICollection<ProviderOffer> ProviderOffers { get; set; } = new List<ProviderOffer>();

    public ICollection<RequestHistory> RequestHistories { get; set; } = new List<RequestHistory>();

    public Examination? Examination { get; set; }

    public ServiceExecution? ServiceExecution { get; set; }
}