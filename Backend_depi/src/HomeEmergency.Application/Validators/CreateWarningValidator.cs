using FluentValidation;
using HomeEmergency.Application.DTOs.Warnings;

namespace HomeEmergency.Application.Validators;

public class CreateWarningValidator : AbstractValidator<CreateWarningDto>
{
    public CreateWarningValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Title is required.")
            .MaximumLength(200).WithMessage("Title must not exceed 200 characters.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("Reason is required.")
            .MaximumLength(500).WithMessage("Reason must not exceed 500 characters.");

        RuleFor(x => x.SeverityLevel)
            .NotEmpty().WithMessage("Severity level is required.")
            .Must(level => level == "Low" || level == "Medium" || level == "High")
            .WithMessage("Severity level must be 'Low', 'Medium', or 'High'.");
    }
}

