using System;

namespace HomeEmergency.Application.DTOs.Examinations;

public class CreateExaminationDto
{
    public Guid ServiceRequestId { get; set; }

    public string Report { get; set; } = string.Empty;

    public decimal EstimatedPrice { get; set; }
}

public class ApproveExaminationDto
{
    public bool IsApproved { get; set; }
}

public class ExaminationDto
{
    public Guid Id { get; set; }

    public Guid ServiceRequestId { get; set; }

    public Guid ProviderId { get; set; }

    public string Report { get; set; } = string.Empty;

    public decimal EstimatedPrice { get; set; }

    public bool IsApproved { get; set; }

    public DateTime ExaminedAt { get; set; }

    public DateTime CreatedAt { get; set; }
}
