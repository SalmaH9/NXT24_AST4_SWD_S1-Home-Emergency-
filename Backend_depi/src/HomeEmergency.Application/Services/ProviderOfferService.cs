using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using AutoMapper;
using HomeEmergency.Application.DTOs.ProviderOffers;
using HomeEmergency.Application.Helpers;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.Services;

public class ProviderOfferService : IProviderOfferService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProviderOfferService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ProviderOfferDto> CreateOfferAsync(Guid providerId, CreateProviderOfferDto request)
    {
        var serviceRequest = await _unitOfWork.ServiceRequests.GetByIdAsync(request.ServiceRequestId);

        if (serviceRequest == null)
            throw new KeyNotFoundException("Service request not found.");

        var offer = _mapper.Map<ProviderOffer>(request);

        offer.ProviderId = providerId;

        await _unitOfWork.ProviderOffers.AddAsync(offer);

        await _unitOfWork.CompleteAsync();

        return _mapper.Map<ProviderOfferDto>(offer);
    }

    public async Task<IEnumerable<ProviderOfferDto>> GetOffersByRequestAsync(Guid requestId)
    {
        var offers = await _unitOfWork.ProviderOffers.FindAsync(x => x.ServiceRequestId == requestId);

        return _mapper.Map<IEnumerable<ProviderOfferDto>>(offers);
    }

    public async Task<bool> SelectProviderAsync(Guid requestId, Guid providerId)
    {
        var request = await _unitOfWork.ServiceRequests.GetByIdAsync(requestId);

        if (request == null)
            return false;

        // Capture old status before mutation
        var oldStatus = request.Status.ToString();

        request.SelectedProviderId = providerId;
        request.Status = ServiceRequestStatus.ProviderSelected;

        _unitOfWork.ServiceRequests.Update(request);

        // Record status transition atomically with the update
        await RequestHistoryHelper.RecordAsync(
            _unitOfWork,
            requestId,
            oldStatus: oldStatus,
            newStatus: ServiceRequestStatus.ProviderSelected.ToString(),
            comment: "Provider selected by customer.",
            changedBy: providerId);

        await _unitOfWork.CompleteAsync();

        return true;
    }
}