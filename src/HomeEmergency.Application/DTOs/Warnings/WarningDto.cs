using System;

namespace HomeEmergency.Application.DTOs.Warnings;

public class WarningDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid IssuedBy { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string SeverityLevel { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

