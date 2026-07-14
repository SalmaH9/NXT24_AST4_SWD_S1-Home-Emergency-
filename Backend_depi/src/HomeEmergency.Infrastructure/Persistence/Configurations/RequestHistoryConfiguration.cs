using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeEmergency.Infrastructure.Persistence.Configurations;

public class RequestHistoryConfiguration : IEntityTypeConfiguration<RequestHistory>
{
    public void Configure(EntityTypeBuilder<RequestHistory> builder)
    {
        builder.ToTable("RequestHistories");

        builder.Property(x => x.OldStatus)
            .HasMaxLength(100);

        builder.Property(x => x.NewStatus)
            .HasMaxLength(100);

        builder.Property(x => x.Comment)
            .HasMaxLength(1000);

        builder.HasOne(x => x.ServiceRequest)
            .WithMany(x => x.RequestHistories)
            .HasForeignKey(x => x.ServiceRequestId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
