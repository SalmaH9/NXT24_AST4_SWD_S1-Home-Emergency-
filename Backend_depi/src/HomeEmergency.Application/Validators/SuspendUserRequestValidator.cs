using FluentValidation;
using HomeEmergency.Application.DTOs.Admin;

namespace HomeEmergency.Application.Validators;

public class SuspendUserRequestValidator : AbstractValidator<SuspendUserRequestDto>
{
    public SuspendUserRequestValidator()
    {
        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Suspension reason is required.")
            .MaximumLength(500).WithMessage("Suspension reason must not exceed 500 characters.");
    }
}

