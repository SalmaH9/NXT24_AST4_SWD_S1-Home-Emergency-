using System.Collections.Generic;

namespace HomeEmergency.Application.DTOs.Admin;

public class AnalyticsQueryDto
{
    public DateOnly? From { get; set; }
    public DateOnly? To { get; set; }
    public string GroupBy { get; set; } = "day";
}

public class UserAnalyticsDto
{
    public List<TimeSeriesPointDto> Registrations { get; set; } = new();
    public List<TimeSeriesPointDto> Roles { get; set; } = new();
    public List<TimeSeriesPointDto> Statuses { get; set; } = new();
}

public class CommunicationAnalyticsDto
{
    public int TotalChats { get; set; }
    public int TotalMessages { get; set; }
    public int ActiveChats { get; set; }
    public double AverageMessagesPerChat { get; set; }
    public List<TimeSeriesPointDto> MessagesPerPeriod { get; set; } = new();
}

public class RatingAnalyticsDto
{
    public double AverageRating { get; set; }
    public List<TimeSeriesPointDto> Distribution { get; set; } = new();
    public List<LowRatedUserDto> LowRatedUsers { get; set; } = new();
}

public class LowRatedUserDto
{
    public Guid UserId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public double AverageRating { get; set; }
    public int RatingsCount { get; set; }
}

public class AdvertisementAnalyticsDto
{
    public List<TimeSeriesPointDto> StatusCounts { get; set; } = new();
    public List<TimeSeriesPointDto> ActiveAdsByCategory { get; set; } = new();
}

public class AIAnalyticsDto
{
    public int ArchivedConversations { get; set; }
    public int ActiveConversations { get; set; }
    public double AverageMessagesPerConversation { get; set; }
    public List<TimeSeriesPointDto> ConversationsPerPeriod { get; set; } = new();
    public List<TimeSeriesPointDto> SuggestedCategories { get; set; } = new();
}

public class EmptyAnalyticsDto
{
    public string Message { get; set; } = string.Empty;
}
