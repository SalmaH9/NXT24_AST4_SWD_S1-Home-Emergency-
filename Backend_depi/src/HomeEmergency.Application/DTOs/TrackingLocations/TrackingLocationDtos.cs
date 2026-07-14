using System;

namespace HomeEmergency.Application.DTOs.TrackingLocations;

public class AddTrackingLocationDto
{
    public Guid ServiceExecutionId { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }
}

public class TrackingLocationDto
{
    public Guid Id { get; set; }

    public Guid ServiceExecutionId { get; set; }

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public DateTime RecordedAt { get; set; }

    public DateTime CreatedAt { get; set; }
}
