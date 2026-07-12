using FluentValidation;
using HomeEmergency.Application.DTOs.Profiles;

namespace HomeEmergency.Application.Validators;

public class UpdateProfileRequestValidator : AbstractValidator<UpdateProfileRequestDto>
{
    public UpdateProfileRequestValidator()
    {
        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full Name is required.")
            .MaximumLength(150).WithMessage("Full Name must not exceed 150 characters.");

        RuleFor(x => x.PhoneNumber)
            .MaximumLength(20).WithMessage("Phone number must not exceed 20 characters.");

        RuleFor(x => x.ServiceRadiusKm)
            .GreaterThan(0).WithMessage("Service radius must be greater than 0.")
            .When(x => x.ServiceRadiusKm.HasValue);

        RuleFor(x => x.ExperienceYears)
            .GreaterThanOrEqualTo(0).WithMessage("Experience years cannot be negative.")
            .When(x => x.ExperienceYears.HasValue);

        RuleFor(x => x.EmployeeCount)
            .GreaterThan(0).WithMessage("Employee count must be greater than 0.")
            .When(x => x.EmployeeCount.HasValue);

        RuleFor(x => x.AvailabilityStatus)
            .Must(status => status == "Available" || status == "Busy" || status == "Offline")
            .WithMessage("Availability status must be 'Available', 'Busy', or 'Offline'.")
            .When(x => !string.IsNullOrEmpty(x.AvailabilityStatus));
    }
}

