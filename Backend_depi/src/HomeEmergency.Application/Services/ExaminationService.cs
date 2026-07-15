using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using AutoMapper;
using HomeEmergency.Application.DTOs.Examinations;
using HomeEmergency.Application.Helpers;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.Services;

public class ExaminationService : IExaminationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly INotificationService _notificationService;

    public ExaminationService(IUnitOfWork unitOfWork, IMapper mapper, INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _notificationService = notificationService;
    }

    public async Task<ExaminationDto> CreateExaminationAsync(Guid providerId, CreateExaminationDto request)
    {
        var serviceRequest = await _unitOfWork.ServiceRequests.GetByIdAsync(request.ServiceRequestId);

        if (serviceRequest == null)
            throw new KeyNotFoundException("Service request not found.");

        // Prevent duplicate examinations for the same request
        var existing = await _unitOfWork.Examinations.FindAsync(
            x => x.ServiceRequestId == request.ServiceRequestId);

        if (existing.Any())
            throw new InvalidOperationException("An examination already exists for this service request.");

        // Capture old status before mutation
        var oldStatus = serviceRequest.Status.ToString();

        var examination = _mapper.Map<Examination>(request);

        examination.ProviderId = providerId;
        examination.ExaminedAt = DateTime.UtcNow;

        // Transition request to WaitingCustomerApproval — the report is
        // now submitted and awaiting the customer's decision
        serviceRequest.Status = ServiceRequestStatus.WaitingCustomerApproval;

        await _unitOfWork.Examinations.AddAsync(examination);
        _unitOfWork.ServiceRequests.Update(serviceRequest);

        // Record status transition atomically with the examination insert
        await RequestHistoryHelper.RecordAsync(
            _unitOfWork,
            request.ServiceRequestId,
            oldStatus: oldStatus,
            newStatus: ServiceRequestStatus.WaitingCustomerApproval.ToString(),
            comment: "Examination submitted by provider. Awaiting customer approval.",
            changedBy: providerId);

        await _unitOfWork.CompleteAsync();

        try
        {
            await _notificationService.CreateAsync(
                serviceRequest.CustomerId,
                NotificationType.ExaminationSubmitted,
                "Inspection Report Submitted",
                $"Technician has submitted an inspection report for request {serviceRequest.Description.Substring(0, Math.Min(20, serviceRequest.Description.Length))}..."
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Notification failed: {ex.Message}");
        }

        return _mapper.Map<ExaminationDto>(examination);
    }

    public async Task<bool> ApproveExaminationAsync(Guid customerId, Guid examinationId, ApproveExaminationDto request)
    {
        var examination = await _unitOfWork.Examinations.GetByIdAsync(examinationId);

        if (examination == null)
            throw new KeyNotFoundException("Examination not found.");

        var serviceRequest = await _unitOfWork.ServiceRequests.GetByIdAsync(examination.ServiceRequestId);

        if (serviceRequest == null || serviceRequest.CustomerId != customerId)
            throw new InvalidOperationException("You are not authorised to approve this examination.");

        var oldStatus = serviceRequest.Status.ToString();

        examination.IsApproved = request.IsApproved;
        _unitOfWork.Examinations.Update(examination);

        if (request.IsApproved)
        {
            // ✅ العميل وافق.
            // ⚠️ ماتغيّريش الحالة هنا! لازم تفضل WaitingCustomerApproval
            //    عشان StartExecutionAsync يقبلها. الفني هو اللي هينقلها
            //    لـ InProgress لما يبدأ فعلًا — وساعتها هيتعمل سجل التنفيذ.
            await RequestHistoryHelper.RecordAsync(
                _unitOfWork,
                serviceRequest.Id,
                oldStatus: oldStatus,
                newStatus: oldStatus,   // الحالة ما اتغيرتش — بنسجّل الموافقة بس
                comment: "Customer approved the examination. Provider may now start the repair.",
                changedBy: customerId);
        }
        else
        {
            // ❌ العميل رفض → الطلب يرجع للمزايدة
            serviceRequest.Status = ServiceRequestStatus.SearchingForProviders;
            serviceRequest.SelectedProviderId = null;   // نفك ارتباط الفني
            _unitOfWork.ServiceRequests.Update(serviceRequest);

            await RequestHistoryHelper.RecordAsync(
                _unitOfWork,
                serviceRequest.Id,
                oldStatus: oldStatus,
                newStatus: ServiceRequestStatus.SearchingForProviders.ToString(),
                comment: "Customer rejected the repair cost. Request reopened for other providers.",
                changedBy: customerId);
        }

        await _unitOfWork.CompleteAsync();
        return true;
    }

    public async Task<ExaminationDto?> GetExaminationByRequestAsync(Guid serviceRequestId)
    {
        var results = await _unitOfWork.Examinations.FindAsync(
            x => x.ServiceRequestId == serviceRequestId);

        var examination = results.FirstOrDefault();

        if (examination == null)
            return null;

        return _mapper.Map<ExaminationDto>(examination);
    }

    public async Task<IEnumerable<ExaminationDto>> GetExaminationsByProviderAsync(Guid providerId)
    {
        var examinations = await _unitOfWork.Examinations.FindAsync(
            x => x.ProviderId == providerId);

        return _mapper.Map<IEnumerable<ExaminationDto>>(examinations);
    }
}
