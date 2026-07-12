using FluentValidation;
using HomeEmergency.Application.DTOs.Verification;

namespace HomeEmergency.Application.Validators;

public class ReviewDocumentRequestValidator : AbstractValidator<ReviewDocumentRequestDto>
{
    public ReviewDocumentRequestValidator()
    {
        RuleFor(x => x.ReviewComments)
            .NotEmpty().WithMessage("Review comments/rejection reason must be provided.")
            .MaximumLength(500).WithMessage("Review comments must not exceed 500 characters.");
    }
}

