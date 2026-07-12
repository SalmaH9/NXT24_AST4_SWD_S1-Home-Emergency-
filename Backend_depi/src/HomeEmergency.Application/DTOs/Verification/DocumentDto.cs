using System;

namespace HomeEmergency.Application.DTOs.Verification;

public class DocumentDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string DocumentType { get; set; } = string.Empty;
    public string DocumentUrl { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public Guid? ReviewedBy { get; set; }
    public string? ReviewComments { get; set; }
    public DateTime CreatedAt { get; set; }
}

