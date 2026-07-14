using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeEmergency.Infrastructure.Persistence.Configurations;

public class ExaminationConfiguration : IEntityTypeConfiguration<Examination>
{
    public void Configure(EntityTypeBuilder<Examination> builder)
    {
        builder.ToTable("Examinations");

        builder.Property(x => x.Report)
            .HasMaxLength(2000);

        builder.Property(x => x.EstimatedPrice)
            .HasColumnType("decimal(18,2)");

        builder.HasOne(x => x.ServiceRequest)
            .WithOne(x => x.Examination)
            .HasForeignKey<Examination>(x => x.ServiceRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Provider)
            .WithMany(x => x.Examinations)
            .HasForeignKey(x => x.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
