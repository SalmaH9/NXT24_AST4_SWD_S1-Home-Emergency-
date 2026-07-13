using System;
using HomeEmergency.Domain.Enums;

namespace HomeEmergency.Application.DTOs.Ratings;

public class CreateRatingRequestDto
{
    public Guid? ServiceRequestId { get; set; }
    public Guid? ServiceExecutionId { get; set; }
    public Guid ReceiverUserId { get; set; }
    public Guid? ProviderId { get; set; }
    public int RatingValue { get; set; }
    public string? Comment { get; set; }
    public RatingStage RatingStage { get; set; }
}

public class RatingDto
{
    public Guid Id { get; set; }
    public Guid? ServiceRequestId { get; set; }
    public Guid? ServiceExecutionId { get; set; }
    public Guid SenderUserId { get; set; }
    public string SenderName { get; set; } = string.Empty;
    public Guid ReceiverUserId { get; set; }
    public string ReceiverName { get; set; } = string.Empty;
    public Guid? ProviderId { get; set; }
    public int RatingValue { get; set; }
    public string? Comment { get; set; }
    public RatingStage RatingStage { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class RatingSummaryDto
{
    public Guid UserId { get; set; }
    public int TotalRatings { get; set; }
    public double AverageRating { get; set; }
    public int OneStarCount { get; set; }
    public int TwoStarCount { get; set; }
    public int ThreeStarCount { get; set; }
    public int FourStarCount { get; set; }
    public int FiveStarCount { get; set; }
}
