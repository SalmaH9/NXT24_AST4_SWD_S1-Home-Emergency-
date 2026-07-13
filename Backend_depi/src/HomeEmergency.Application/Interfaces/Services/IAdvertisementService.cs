using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using HomeEmergency.Application.DTOs.Admin;
using HomeEmergency.Application.DTOs.Advertisements;

namespace HomeEmergency.Application.Interfaces.Services;

public interface IAdvertisementService
{
    Task<AdvertisementDto> CreateAsync(Guid companyUserId, CreateAdvertisementRequestDto request, Stream? mediaStream,
        string? fileName, CancellationToken cancellationToken = default);
    Task<PaginatedListDto<AdvertisementDto>> GetMyAdvertisementsAsync(Guid companyUserId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<AdvertisementDto> GetByIdAsync(Guid requesterUserId, Guid advertisementId, bool isAdmin, CancellationToken cancellationToken = default);
    Task<AdvertisementDto> UpdateAsync(Guid companyUserId, Guid advertisementId, UpdateAdvertisementRequestDto request,
        Stream? mediaStream, string? fileName, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid companyUserId, Guid advertisementId, CancellationToken cancellationToken = default);
    Task SubmitAsync(Guid companyUserId, Guid advertisementId, CancellationToken cancellationToken = default);
    Task<PaginatedListDto<AdvertisementDto>> GetActiveAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<PaginatedListDto<AdvertisementDto>> GetByCategoryAsync(Guid categoryId, int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<PaginatedListDto<AdvertisementDto>> GetAdminListAsync(int pageNumber, int pageSize, CancellationToken cancellationToken = default);
    Task<AdvertisementDto> ApproveAsync(Guid adminUserId, Guid advertisementId, CancellationToken cancellationToken = default);
    Task<AdvertisementDto> RejectAsync(Guid adminUserId, Guid advertisementId, string reason, CancellationToken cancellationToken = default);
    Task<AdvertisementDto> CancelAsync(Guid adminUserId, Guid advertisementId, string? reason, CancellationToken cancellationToken = default);
}
