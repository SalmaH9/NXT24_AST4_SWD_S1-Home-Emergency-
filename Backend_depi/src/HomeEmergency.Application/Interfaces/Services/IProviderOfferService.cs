using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Application.DTOs.ProviderOffers;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IProviderOfferService
{
    Task<ProviderOfferDto> CreateOfferAsync(Guid providerId, CreateProviderOfferDto request);

    Task<IEnumerable<ProviderOfferDto>> GetOffersByRequestAsync(Guid requestId);

    Task<bool> SelectProviderAsync(Guid requestId, Guid providerId);

    Task<IEnumerable<ProviderOfferDto>> GetProviderOffersAsync(Guid providerId);

    Task<ProviderOfferDto?> UpdateOfferAsync(Guid providerId, Guid offerId, UpdateProviderOfferDto request);

    Task<bool> WithdrawOfferAsync(Guid providerId, Guid offerId);
}
