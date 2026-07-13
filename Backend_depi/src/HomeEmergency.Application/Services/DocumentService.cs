using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using HomeEmergency.Application.DTOs.Files;
using Microsoft.AspNetCore.Identity;
using HomeEmergency.Application.DTOs.Verification;
using HomeEmergency.Application.Interfaces.Persistence;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.Services;

public class DocumentService : IDocumentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IFileStorageService _fileStorageService;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IMapper _mapper;
    private readonly INotificationService _notificationService;

    public DocumentService(
        IUnitOfWork unitOfWork,
        IFileStorageService fileStorageService,
        UserManager<ApplicationUser> userManager,
        IMapper mapper,
        INotificationService notificationService)
    {
        _unitOfWork = unitOfWork;
        _fileStorageService = fileStorageService;
        _userManager = userManager;
        _mapper = mapper;
        _notificationService = notificationService;
    }

    public async Task<DocumentDto> UploadDocumentAsync(Guid userId, Stream fileStream, string fileName, DocumentType documentType)
    {
        var extension = Path.GetExtension(fileName).ToLower();
        var whitelistedExtensions = new[] { ".pdf", ".jpg", ".jpeg", ".png" };

        // 1. Validate file extension structure
        if (!whitelistedExtensions.Contains(extension))
        {
            throw new ArgumentException("Unsupported file extension. Only PDF, JPG, JPEG, and PNG are allowed.");
        }

        // 2. Validate magic bytes signature headers
        if (!_fileStorageService.ValidateFileSignature(fileStream, extension))
        {
            throw new InvalidOperationException("Invalid file format signature detected.");
        }

        // 3. Save file using sanitized GUID and return the relative path
        var relativeUrl = await _fileStorageService.SaveProtectedFileAsync(fileStream, fileName, "verification-documents");

        // 4. Create database record
        var document = new VerificationDocument
        {
            UserId = userId,
            DocumentType = documentType,
            DocumentUrl = relativeUrl,
            Status = DocumentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.VerificationDocuments.AddAsync(document);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<DocumentDto>(document);
    }

    public async Task<IEnumerable<DocumentDto>> GetUserDocumentsAsync(Guid userId)
    {
        var documents = await _unitOfWork.VerificationDocuments.FindAsync(d => d.UserId == userId);
        return _mapper.Map<IEnumerable<DocumentDto>>(documents);
    }

    public async Task<IEnumerable<DocumentDto>> GetPendingDocumentsAsync()
    {
        var pendingDocs = await _unitOfWork.VerificationDocuments.FindAsync(d => d.Status == DocumentStatus.Pending);
        return _mapper.Map<IEnumerable<DocumentDto>>(pendingDocs);
    }

    public async Task<StoredFileDownloadDto> DownloadDocumentAsync(Guid documentId, Guid requesterUserId, bool isAdmin)
    {
        var document = await _unitOfWork.VerificationDocuments.GetByIdAsync(documentId);
        if (document == null)
        {
            throw new KeyNotFoundException("Verification document not found.");
        }

        if (!isAdmin && document.UserId != requesterUserId)
        {
            throw new UnauthorizedAccessException("You are not allowed to access this document.");
        }

        return await _fileStorageService.OpenReadAsync(document.DocumentUrl);
    }

    public async Task<bool> ApproveDocumentAsync(Guid documentId, Guid adminId)
    {
        // 1. Retrieve the document
        var document = await _unitOfWork.VerificationDocuments.GetByIdAsync(documentId);
        if (document == null)
        {
            throw new KeyNotFoundException("Verification document not found.");
        }

        // 2. Update status to Approved
        document.Status = DocumentStatus.Approved;
        document.ReviewedBy = adminId;
        document.ReviewComments = "Approved by Administrator.";
        document.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.VerificationDocuments.Update(document);

        // 3. User status promotion check:
        // If the user's status is currently Pending, change it to Active because they have an approved document.
        var user = await _userManager.FindByIdAsync(document.UserId.ToString());
        if (user != null && user.Status == AccountStatus.Pending)
        {
            user.Status = AccountStatus.Active;
            user.UpdatedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                var errors = string.Join(" ", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to update user status during document approval: {errors}");
            }
        }

        // Commit modifications
        await _unitOfWork.CompleteAsync();
        await _notificationService.CreateAsync(document.UserId, NotificationType.VerificationApproved,
            "Verification approved", "One of your verification documents has been approved.",
            NotificationReferenceType.VerificationDocument, document.Id);

        return true;
    }

    public async Task<bool> RejectDocumentAsync(Guid documentId, Guid adminId, ReviewDocumentRequestDto reviewDto)
    {
        // 1. Retrieve the document
        var document = await _unitOfWork.VerificationDocuments.GetByIdAsync(documentId);
        if (document == null)
        {
            throw new KeyNotFoundException("Verification document not found.");
        }

        // 2. Update status to Rejected and log the comment
        document.Status = DocumentStatus.Rejected;
        document.ReviewedBy = adminId;
        document.ReviewComments = reviewDto.ReviewComments ?? "Rejected by Administrator.";
        document.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.VerificationDocuments.Update(document);
        await _unitOfWork.CompleteAsync();
        await _notificationService.CreateAsync(document.UserId, NotificationType.VerificationRejected,
            "Verification rejected", document.ReviewComments ?? "Your verification document was rejected.",
            NotificationReferenceType.VerificationDocument, document.Id);

        return true;
    }
}

