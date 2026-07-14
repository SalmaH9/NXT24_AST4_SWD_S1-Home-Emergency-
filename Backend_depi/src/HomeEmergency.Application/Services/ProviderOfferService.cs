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
    private readonly INotificationService _notificationService;

    public ProviderOfferService(IUnitOfWork unitOfWork, IMapper mapper, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationService = notificationService;
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

        try
        {
            await _notificationService.CreateAsync(
                serviceRequest.CustomerId,
                NotificationType.ServiceRequestCreated,
                "New Offer Received",
                $"A provider has submitted an offer of {offer.Price} USD for request {serviceRequest.Description.Substring(0, Math.Min(20, serviceRequest.Description.Length))}..."
            );
        }
        catch (Exception ex)
        {
            // Fail gracefully if notification fails
            Console.WriteLine($"Notification failed: {ex.Message}");
        }

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

        try
        {
            await _notificationService.CreateAsync(
                providerId,
                NotificationType.ProviderAccepted,
                "Offer Accepted",
                $"Your offer for service request has been accepted by the customer."
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Notification failed: {ex.Message}");
        }

        return true;
    }

    public async Task<IEnumerable<ProviderOfferDto>> GetProviderOffersAsync(Guid providerId)
    {
        var offers = await _unitOfWork.ProviderOffers.FindAsync(x => x.ProviderId == providerId);
        return _mapper.Map<IEnumerable<ProviderOfferDto>>(offers);
    }

    public async Task<ProviderOfferDto?> UpdateOfferAsync(Guid providerId, Guid offerId, UpdateProviderOfferDto request)
    {
        var offer = await _unitOfWork.ProviderOffers.GetByIdAsync(offerId);
        if (offer == null)
            return null;

        if (offer.ProviderId != providerId)
            throw new UnauthorizedAccessException("You can only update your own offers.");

        if (offer.IsAccepted)
            throw new InvalidOperationException("Cannot update an offer that has already been accepted.");

        offer.Price = request.Price;
        offer.Notes = request.Notes;

        _unitOfWork.ProviderOffers.Update(offer);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<ProviderOfferDto>(offer);
    }

    public async Task<bool> WithdrawOfferAsync(Guid providerId, Guid offerId)
    {
        var offer = await _unitOfWork.ProviderOffers.GetByIdAsync(offerId);
        if (offer == null)
            return false;

        if (offer.ProviderId != providerId)
            throw new UnauthorizedAccessException("You can only withdraw your own offers.");

        if (offer.IsAccepted)
            throw new InvalidOperationException("Cannot withdraw an offer that has already been accepted.");

        _unitOfWork.ProviderOffers.Delete(offer);
        await _unitOfWork.CompleteAsync();

        return true;
    }
}