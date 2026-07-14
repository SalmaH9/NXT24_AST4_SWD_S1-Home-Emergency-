using System;

namespace HomeEmergency.Application.DTOs.ServiceExecutions;

public class StartServiceExecutionDto
{
    public Guid ServiceRequestId { get; set; }
}

public class CompleteServiceExecutionDto
{
    public Guid ServiceExecutionId { get; set; }
}

public class ServiceExecutionDto
{
    public Guid Id { get; set; }

    public Guid ServiceRequestId { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? FinishedAt { get; set; }

    public bool IsCompleted { get; set; }

    public DateTime CreatedAt { get; set; }
}
