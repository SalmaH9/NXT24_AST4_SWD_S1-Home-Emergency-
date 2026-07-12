using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Verification;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IDocumentService
{
    Task<DocumentDto> UploadDocumentAsync(Guid userId, Stream fileStream, string fileName, DocumentType documentType);
    Task<IEnumerable<DocumentDto>> GetUserDocumentsAsync(Guid userId);
    Task<IEnumerable<DocumentDto>> GetPendingDocumentsAsync();
    Task<bool> ApproveDocumentAsync(Guid documentId, Guid adminId);
    Task<bool> RejectDocumentAsync(Guid documentId, Guid adminId, ReviewDocumentRequestDto reviewDto);
}

