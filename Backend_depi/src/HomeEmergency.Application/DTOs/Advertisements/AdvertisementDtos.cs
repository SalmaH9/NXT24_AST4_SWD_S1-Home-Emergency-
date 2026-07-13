using System;
using System.Collections.Generic;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.DTOs.Advertisements;

public class CreateAdvertisementRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<Guid> CategoryIds { get; set; } = new();
}

public class UpdateAdvertisementRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public List<Guid> CategoryIds { get; set; } = new();
}

public class ReviewAdvertisementRequestDto
{
    public string? Reason { get; set; }
}

public class AdvertisementDto
{
    public Guid Id { get; set; }
    public Guid CompanyUserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? ImagePath { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public AdvertisementStatus Status { get; set; }
    public string? RejectionReason { get; set; }
    public bool IsDeleted { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<Guid> CategoryIds { get; set; } = new();
}
