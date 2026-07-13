using System;

namespace HomeEmergency.Domain.Entities;

public class AdvertisementCategory
{
    public Guid AdvertisementId { get; set; }
    public Guid ServiceCategoryId { get; set; }

    public virtual Advertisement Advertisement { get; set; } = null!;
}
