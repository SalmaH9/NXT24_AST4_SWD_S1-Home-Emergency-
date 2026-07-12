using FluentValidation;
using HomeEmergency.Application.DTOs.Subscriptions;

namespace HomeEmergency.Application.Validators;

public class CreateSubscriptionPlanValidator : AbstractValidator<CreateSubscriptionPlanDto>
{
    public CreateSubscriptionPlanValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Subscription plan name is required.")
            .MaximumLength(100).WithMessage("Subscription plan name must not exceed 100 characters.");

        RuleFor(x => x.Description)
            .MaximumLength(500).WithMessage("Description must not exceed 500 characters.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(0).WithMessage("Price must be greater than or equal to 0.");

        RuleFor(x => x.DurationInDays)
            .GreaterThan(0).WithMessage("Duration must be at least 1 day.");
    }
}

