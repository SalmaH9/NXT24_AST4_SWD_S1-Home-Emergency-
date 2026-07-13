using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.DTOs.Advertisements;
using HomeEmergency.Application.Interfaces.Services;
using HomeEmergency.Domain.Entities;
using HomeEmergency.Domain.Enums;
using HomeEmergency.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace HomeEmergency.Infrastructure.Services;

public class AdvertisementService : IAdvertisementService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IFileStorageService _fileStorageService;
    private readonly INotificationService _notificationService;

    public AdvertisementService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        IFileStorageService fileStorageService,
        INotificationService notificationService)
    {
        _context = context;
        _userManager = userManager;
        _fileStorageService = fileStorageService;
        _notificationService = notificationService;
    }

    public async Task<AdvertisementDto> CreateAsync(Guid companyUserId, CreateAdvertisementRequestDto request, Stream? mediaStream, string? fileName, CancellationToken cancellationToken = default)
    {
        await EnsureCompanyEligibilityAsync(companyUserId, cancellationToken);
        ValidateAdvertisementRequest(request.Title, request.Description, request.StartDate, request.EndDate, request.CategoryIds);

        var advertisement = new Advertisement
        {
            CompanyUserId = companyUserId,
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            StartDate = request.StartDate.ToUniversalTime(),
            EndDate = request.EndDate.ToUniversalTime(),
            Status = AdvertisementStatus.Draft,
            CreatedAt = DateTime.UtcNow,
            CreatedBy = companyUserId
        };

        if (mediaStream != null && !string.IsNullOrWhiteSpace(fileName))
        {
            advertisement.ImagePath = await _fileStorageService.SavePublicFileAsync(mediaStream, fileName, "advertisements");
        }

        foreach (var categoryId in request.CategoryIds.Distinct())
        {
            advertisement.Categories.Add(new AdvertisementCategory
            {
                ServiceCategoryId = categoryId
            });
        }

        _context.Advertisements.Add(advertisement);
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(companyUserId, advertisement.Id, false, cancellationToken);
    }

    public async Task<PaginatedListDto<AdvertisementDto>> GetMyAdvertisementsAsync(Guid companyUserId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Advertisements
            .AsNoTracking()
            .Include(x => x.Categories)
            .Where(x => x.CompanyUserId == companyUserId && !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt);

        return await ToPagedAsync(query, pageNumber, pageSize, cancellationToken);
    }

    public async Task<AdvertisementDto> GetByIdAsync(Guid requesterUserId, Guid advertisementId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var advertisement = await _context.Advertisements
            .AsNoTracking()
            .Include(x => x.Categories)
            .FirstOrDefaultAsync(x => x.Id == advertisementId && !x.IsDeleted, cancellationToken);

        if (advertisement == null)
        {
            throw new KeyNotFoundException("Advertisement not found.");
        }

        if (!isAdmin && advertisement.CompanyUserId != requesterUserId && GetEffectiveStatus(advertisement) != AdvertisementStatus.Active)
        {
            throw new KeyNotFoundException("Advertisement not found.");
        }

        return MapAdvertisement(advertisement);
    }

    public async Task<AdvertisementDto> UpdateAsync(Guid companyUserId, Guid advertisementId, UpdateAdvertisementRequestDto request, Stream? mediaStream, string? fileName, CancellationToken cancellationToken = default)
    {
        ValidateAdvertisementRequest(request.Title, request.Description, request.StartDate, request.EndDate, request.CategoryIds);
        var advertisement = await LoadOwnedAdvertisementAsync(companyUserId, advertisementId, cancellationToken);

        if (advertisement.Status == AdvertisementStatus.Active || advertisement.Status == AdvertisementStatus.Cancelled)
        {
            throw new InvalidOperationException("Active or cancelled advertisements cannot be edited.");
        }

        advertisement.Title = request.Title.Trim();
        advertisement.Description = request.Description.Trim();
        advertisement.StartDate = request.StartDate.ToUniversalTime();
        advertisement.EndDate = request.EndDate.ToUniversalTime();
        advertisement.UpdatedAt = DateTime.UtcNow;

        if (mediaStream != null && !string.IsNullOrWhiteSpace(fileName))
        {
            if (!string.IsNullOrWhiteSpace(advertisement.ImagePath))
            {
                _fileStorageService.DeleteFile(advertisement.ImagePath);
            }

            advertisement.ImagePath = await _fileStorageService.SavePublicFileAsync(mediaStream, fileName, "advertisements");
        }

        _context.AdvertisementCategories.RemoveRange(advertisement.Categories);
        advertisement.Categories = request.CategoryIds.Distinct().Select(categoryId => new AdvertisementCategory
        {
            AdvertisementId = advertisement.Id,
            ServiceCategoryId = categoryId
        }).ToList();

        await _context.SaveChangesAsync(cancellationToken);
        return await GetByIdAsync(companyUserId, advertisement.Id, false, cancellationToken);
    }

    public async Task DeleteAsync(Guid companyUserId, Guid advertisementId, CancellationToken cancellationToken = default)
    {
        var advertisement = await LoadOwnedAdvertisementAsync(companyUserId, advertisementId, cancellationToken);
        advertisement.IsDeleted = true;
        advertisement.Status = AdvertisementStatus.Cancelled;
        advertisement.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task SubmitAsync(Guid companyUserId, Guid advertisementId, CancellationToken cancellationToken = default)
    {
        var advertisement = await LoadOwnedAdvertisementAsync(companyUserId, advertisementId, cancellationToken);
        if (advertisement.Categories.Count == 0)
        {
            throw new InvalidOperationException("Advertisements must target at least one category.");
        }

        advertisement.Status = AdvertisementStatus.Pending;
        advertisement.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);
    }

    public Task<PaginatedListDto<AdvertisementDto>> GetActiveAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var query = _context.Advertisements
            .AsNoTracking()
            .Include(x => x.Categories)
            .Where(x => !x.IsDeleted &&
                        x.Status == AdvertisementStatus.Approved &&
                        x.StartDate <= now &&
                        x.EndDate >= now)
            .OrderByDescending(x => x.CreatedAt);

        return ToPagedAsync(query, pageNumber, pageSize, cancellationToken);
    }

    public Task<PaginatedListDto<AdvertisementDto>> GetByCategoryAsync(Guid categoryId, int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var query = _context.Advertisements
            .AsNoTracking()
            .Include(x => x.Categories)
            .Where(x => !x.IsDeleted &&
                        x.Categories.Any(c => c.ServiceCategoryId == categoryId) &&
                        x.Status == AdvertisementStatus.Approved &&
                        x.StartDate <= now &&
                        x.EndDate >= now)
            .OrderByDescending(x => x.CreatedAt);

        return ToPagedAsync(query, pageNumber, pageSize, cancellationToken);
    }

    public async Task<PaginatedListDto<AdvertisementDto>> GetAdminListAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default)
    {
        var query = _context.Advertisements
            .AsNoTracking()
            .Include(x => x.Categories)
            .Where(x => !x.IsDeleted)
            .OrderByDescending(x => x.CreatedAt);

        return await ToPagedAsync(query, pageNumber, pageSize, cancellationToken);
    }

    public async Task<AdvertisementDto> ApproveAsync(Guid adminUserId, Guid advertisementId, CancellationToken cancellationToken = default)
    {
        var advertisement = await _context.Advertisements.Include(x => x.Categories)
            .FirstOrDefaultAsync(x => x.Id == advertisementId && !x.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Advertisement not found.");

        advertisement.Status = advertisement.StartDate > DateTime.UtcNow
            ? AdvertisementStatus.Approved
            : AdvertisementStatus.Approved;
        advertisement.RejectionReason = null;
        advertisement.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.CreateAsync(advertisement.CompanyUserId, NotificationType.AdvertisementApproved,
            "Advertisement approved", "Your advertisement has been approved.",
            NotificationReferenceType.Advertisement, advertisement.Id, cancellationToken);

        return await GetByIdAsync(adminUserId, advertisement.Id, true, cancellationToken);
    }

    public async Task<AdvertisementDto> RejectAsync(Guid adminUserId, Guid advertisementId, string reason, CancellationToken cancellationToken = default)
    {
        var advertisement = await _context.Advertisements.Include(x => x.Categories)
            .FirstOrDefaultAsync(x => x.Id == advertisementId && !x.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Advertisement not found.");

        advertisement.Status = AdvertisementStatus.Rejected;
        advertisement.RejectionReason = reason;
        advertisement.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.CreateAsync(advertisement.CompanyUserId, NotificationType.AdvertisementRejected,
            "Advertisement rejected", reason,
            NotificationReferenceType.Advertisement, advertisement.Id, cancellationToken);

        return await GetByIdAsync(adminUserId, advertisement.Id, true, cancellationToken);
    }

    public async Task<AdvertisementDto> CancelAsync(Guid adminUserId, Guid advertisementId, string? reason, CancellationToken cancellationToken = default)
    {
        var advertisement = await _context.Advertisements.Include(x => x.Categories)
            .FirstOrDefaultAsync(x => x.Id == advertisementId && !x.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException("Advertisement not found.");

        advertisement.Status = AdvertisementStatus.Cancelled;
        advertisement.RejectionReason = reason;
        advertisement.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return await GetByIdAsync(adminUserId, advertisement.Id, true, cancellationToken);
    }

    private async Task EnsureCompanyEligibilityAsync(Guid companyUserId, CancellationToken cancellationToken)
    {
        var user = await _userManager.FindByIdAsync(companyUserId.ToString());
        if (user == null || user.IsDeleted)
        {
            throw new KeyNotFoundException("Company user not found.");
        }

        if (!await _userManager.IsInRoleAsync(user, "Company"))
        {
            throw new UnauthorizedAccessException("Only companies can manage advertisements.");
        }

        var hasApprovedDocuments = await _context.VerificationDocuments
            .AnyAsync(x => x.UserId == companyUserId && x.Status == DocumentStatus.Approved, cancellationToken);

        if (!hasApprovedDocuments)
        {
            throw new InvalidOperationException("Company verification is required before creating advertisements.");
        }

        var hasActiveSubscription = await _context.Subscriptions
            .AnyAsync(x => x.UserId == companyUserId && x.Status == "Active" && x.EndDate >= DateTime.UtcNow, cancellationToken);

        if (!hasActiveSubscription)
        {
            throw new InvalidOperationException("An active subscription is required before creating advertisements.");
        }
    }

    private static void ValidateAdvertisementRequest(string title, string description, DateTime startDate, DateTime endDate, List<Guid> categoryIds)
    {
        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException("Title is required.");
        }

        if (string.IsNullOrWhiteSpace(description))
        {
            throw new ArgumentException("Description is required.");
        }

        if (startDate > endDate)
        {
            throw new ArgumentException("Start date must be before end date.");
        }

        if (categoryIds.Count == 0)
        {
            throw new ArgumentException("At least one category is required.");
        }
    }

    private async Task<Advertisement> LoadOwnedAdvertisementAsync(Guid companyUserId, Guid advertisementId, CancellationToken cancellationToken)
    {
        var advertisement = await _context.Advertisements
            .Include(x => x.Categories)
            .FirstOrDefaultAsync(x => x.Id == advertisementId && x.CompanyUserId == companyUserId && !x.IsDeleted, cancellationToken);

        return advertisement ?? throw new KeyNotFoundException("Advertisement not found.");
    }

    private async Task<PaginatedListDto<AdvertisementDto>> ToPagedAsync(IQueryable<Advertisement> query, int pageNumber, int pageSize, CancellationToken cancellationToken)
    {
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return new PaginatedListDto<AdvertisementDto>(items.Select(MapAdvertisement).ToList(), totalCount, pageNumber, pageSize);
    }

    private static AdvertisementDto MapAdvertisement(Advertisement advertisement)
    {
        var effectiveStatus = GetEffectiveStatus(advertisement);
        return new AdvertisementDto
        {
            Id = advertisement.Id,
            CompanyUserId = advertisement.CompanyUserId,
            Title = advertisement.Title,
            Description = advertisement.Description,
            ImagePath = advertisement.ImagePath,
            StartDate = advertisement.StartDate,
            EndDate = advertisement.EndDate,
            Status = effectiveStatus,
            RejectionReason = advertisement.RejectionReason,
            IsDeleted = advertisement.IsDeleted,
            CreatedAt = advertisement.CreatedAt,
            UpdatedAt = advertisement.UpdatedAt,
            CategoryIds = advertisement.Categories.Select(x => x.ServiceCategoryId).ToList()
        };
    }

    private static AdvertisementStatus GetEffectiveStatus(Advertisement advertisement)
    {
        if (advertisement.Status is AdvertisementStatus.Cancelled or AdvertisementStatus.Rejected or AdvertisementStatus.Draft or AdvertisementStatus.Pending)
        {
            return advertisement.Status;
        }

        var now = DateTime.UtcNow;
        if (advertisement.EndDate < now)
        {
            return AdvertisementStatus.Expired;
        }

        if (advertisement.StartDate > now)
        {
            return AdvertisementStatus.Scheduled;
        }

        return AdvertisementStatus.Active;
    }
}
