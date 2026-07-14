using System;
using System.Threading.Tasks;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Domain.Entities;

namespace HomeEmergency.Application.Helpers;

/// <summary>
/// Centralises RequestHistory record creation so that every
/// service that transitions a ServiceRequest status can call a
/// single method instead of duplicating the construction logic.
///
/// IMPORTANT: This method only enqueues the record into the UoW
/// change-tracker. The calling service is responsible for invoking
/// CompleteAsync() after all pending changes have been staged.
/// </summary>
internal static class RequestHistoryHelper
{
    internal static async Task RecordAsync(
        IUnitOfWork unitOfWork,
        Guid serviceRequestId,
        string oldStatus,
        string newStatus,
        string comment,
        Guid? changedBy = null)
    {
        var history = new RequestHistory
        {
            ServiceRequestId = serviceRequestId,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            Comment = comment,
            ChangedBy = changedBy
        };

        await unitOfWork.RequestHistories.AddAsync(history);
    }
}
