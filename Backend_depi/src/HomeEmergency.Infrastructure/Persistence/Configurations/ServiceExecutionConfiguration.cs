using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeEmergency.Infrastructure.Persistence.Configurations;

public class ServiceExecutionConfiguration : IEntityTypeConfiguration<ServiceExecution>
{
    public void Configure(EntityTypeBuilder<ServiceExecution> builder)
    {
        builder.ToTable("ServiceExecutions");

        builder.HasOne(x => x.ServiceRequest)
            .WithOne(x => x.ServiceExecution)
            .HasForeignKey<ServiceExecution>(x => x.ServiceRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(x => x.TrackingLocations)
            .WithOne(x => x.ServiceExecution)
            .HasForeignKey(x => x.ServiceExecutionId);
    }
}
