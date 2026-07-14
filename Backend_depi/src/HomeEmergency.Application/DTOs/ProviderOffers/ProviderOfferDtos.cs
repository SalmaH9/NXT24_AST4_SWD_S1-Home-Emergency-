using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HomeEmergency.Application.DTOs.ProviderOffers;

public class CreateProviderOfferDto
{
    public Guid ServiceRequestId { get; set; }

    public decimal Price { get; set; }

    public string Notes { get; set; } = string.Empty;
}

public class ProviderOfferDto
{
    public Guid Id { get; set; }

    public Guid ServiceRequestId { get; set; }

    public Guid ProviderId { get; set; }

    public decimal Price { get; set; }

    public string Notes { get; set; } = string.Empty;

    public bool IsAccepted { get; set; }
}

public class SelectProviderDto
{
    public Guid ProviderId { get; set; }
}