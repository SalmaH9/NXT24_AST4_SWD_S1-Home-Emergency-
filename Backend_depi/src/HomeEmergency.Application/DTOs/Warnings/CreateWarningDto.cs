namespace HomeEmergency.Application.DTOs.Warnings;

public class CreateWarningDto
{
    public string Title { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public string SeverityLevel { get; set; } = "Low"; // e.g. Low, Medium, High
}

