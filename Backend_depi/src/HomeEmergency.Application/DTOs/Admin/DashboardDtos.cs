using System;
using System.Collections.Generic;

namespace HomeEmergency.Application.DTOs.Admin;

public class DashboardSummaryDto
{
    public int TotalUsers { get; set; }
    public int ActiveUsers { get; set; }
    public int SuspendedUsers { get; set; }
    public int Customers { get; set; }
    public int Providers { get; set; }
    public int Companies { get; set; }
    public int PendingVerifications { get; set; }
    public int ActiveSubscriptions { get; set; }
    public int ExpiredSubscriptions { get; set; }
    public int PendingAdvertisements { get; set; }
    public int ActiveAdvertisements { get; set; }
    public int ExpiredAdvertisements { get; set; }
    public int TotalChats { get; set; }
    public int TotalMessages { get; set; }
    public int UnreadNotifications { get; set; }
    public int TotalRatings { get; set; }
    public double AverageProviderRating { get; set; }
    public int WarningsIssued { get; set; }
    public int AIConversations { get; set; }
}

public class RecentActivityItemDto
{
    public string Type { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class TimeSeriesPointDto
{
    public string Label { get; set; } = string.Empty;
    public int Value { get; set; }
}

public class RatingOverviewDto
{
    public double AverageRating { get; set; }
    public int TotalRatings { get; set; }
    public List<TimeSeriesPointDto> Distribution { get; set; } = new();
}

public class AdvertisementOverviewDto
{
    public int Pending { get; set; }
    public int Active { get; set; }
    public int Rejected { get; set; }
    public int ExpiringSoon { get; set; }
}

public class CommunicationOverviewDto
{
    public int TotalChats { get; set; }
    public int ActiveChats { get; set; }
    public int TotalMessages { get; set; }
    public double AverageMessagesPerChat { get; set; }
}
