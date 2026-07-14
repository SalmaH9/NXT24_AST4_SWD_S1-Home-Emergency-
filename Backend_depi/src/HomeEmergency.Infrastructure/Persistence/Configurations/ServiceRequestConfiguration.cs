using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HomeEmergency.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HomeEmergency.Infrastructure.Persistence.Configurations;

public class ServiceRequestConfiguration : IEntityTypeConfiguration<ServiceRequest>
{
    public void Configure(EntityTypeBuilder<ServiceRequest> builder)
    {
        builder.ToTable("ServiceRequests");

        builder.Property(x => x.Description)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(x => x.Address)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(x => x.Status)
            .HasConversion<string>();

        builder.Property(x => x.RequiredProviders)
            .HasDefaultValue(1);

        builder.HasOne(x => x.Customer)
            .WithMany(x => x.ServiceRequests)
            .HasForeignKey(x => x.CustomerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.SelectedProvider)
            .WithMany(x => x.AssignedServiceRequests)
            .HasForeignKey(x => x.SelectedProviderId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.ProviderOffers)
            .WithOne(x => x.ServiceRequest)
            .HasForeignKey(x => x.ServiceRequestId);

        builder.HasMany(x => x.RequestHistories)
            .WithOne(x => x.ServiceRequest)
            .HasForeignKey(x => x.ServiceRequestId);

        builder.HasOne(x => x.Examination)
            .WithOne(x => x.ServiceRequest)
            .HasForeignKey<Examination>(x => x.ServiceRequestId);

        builder.HasOne(x => x.ServiceExecution)
            .WithOne(x => x.ServiceRequest)
            .HasForeignKey<ServiceExecution>(x => x.ServiceRequestId);
    }
}