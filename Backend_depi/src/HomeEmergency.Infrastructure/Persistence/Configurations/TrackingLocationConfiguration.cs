using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeEmergency.Infrastructure.Persistence.Configurations;

public class TrackingLocationConfiguration : IEntityTypeConfiguration<TrackingLocation>
{
    public void Configure(EntityTypeBuilder<TrackingLocation> builder)
    {
        builder.ToTable("TrackingLocations");

        builder.Property(x => x.Latitude)
            .IsRequired();

        builder.Property(x => x.Longitude)
            .IsRequired();

        builder.HasOne(x => x.ServiceExecution)
            .WithMany(x => x.TrackingLocations)
            .HasForeignKey(x => x.ServiceExecutionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}