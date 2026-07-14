using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeEmergency.Infrastructure.Persistence.Configurations;

public class ProviderOfferConfiguration : IEntityTypeConfiguration<ProviderOffer>
{
    public void Configure(EntityTypeBuilder<ProviderOffer> builder)
    {
        builder.ToTable("ProviderOffers");

        builder.Property(x => x.Price)
            .HasColumnType("decimal(18,2)");

        builder.Property(x => x.Notes)
            .HasMaxLength(500);

        builder.HasOne(x => x.ServiceRequest)
            .WithMany(x => x.ProviderOffers)
            .HasForeignKey(x => x.ServiceRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Provider)
            .WithMany(x => x.ProviderOffers)
            .HasForeignKey(x => x.ProviderId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}