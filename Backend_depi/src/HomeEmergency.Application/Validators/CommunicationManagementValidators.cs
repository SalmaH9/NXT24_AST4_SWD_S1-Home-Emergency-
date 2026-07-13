using FluentValidation;
using HomeEmergency.Application.DTOs.AI;
using HomeEmergency.Application.DTOs.Advertisements;
using HomeEmergency.Application.DTOs.Chats;
using HomeEmergency.Application.DTOs.Notifications;
using HomeEmergency.Application.DTOs.Ratings;

namespace HomeEmergency.Application.Validators;

public class CreateChatRequestValidator : AbstractValidator<CreateChatRequestDto>
{
    public CreateChatRequestValidator()
    {
        RuleFor(x => x.ParticipantUserIds)
            .NotEmpty().WithMessage("At least one participant is required.");
    }
}

public class CreateMessageRequestValidator : AbstractValidator<CreateMessageRequestDto>
{
    public CreateMessageRequestValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().MaximumLength(4000);
    }
}

public class UpdateMessageRequestValidator : AbstractValidator<UpdateMessageRequestDto>
{
    public UpdateMessageRequestValidator()
    {
        RuleFor(x => x.Content)
            .NotEmpty().MaximumLength(4000);
    }
}

public class CreateSystemNotificationRequestValidator : AbstractValidator<CreateSystemNotificationRequestDto>
{
    public CreateSystemNotificationRequestValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Body).NotEmpty().MaximumLength(2000);
    }
}

public class CreateRatingRequestValidator : AbstractValidator<CreateRatingRequestDto>
{
    public CreateRatingRequestValidator()
    {
        RuleFor(x => x.ReceiverUserId).NotEmpty();
        RuleFor(x => x.RatingValue).InclusiveBetween(1, 5);
        RuleFor(x => x.Comment).MaximumLength(1000);
    }
}

public class CreateAdvertisementRequestValidator : AbstractValidator<CreateAdvertisementRequestDto>
{
    public CreateAdvertisementRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.CategoryIds).NotEmpty();
        RuleFor(x => x).Must(x => x.StartDate <= x.EndDate)
            .WithMessage("Start date must be before end date.");
    }
}

public class UpdateAdvertisementRequestValidator : AbstractValidator<UpdateAdvertisementRequestDto>
{
    public UpdateAdvertisementRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(4000);
        RuleFor(x => x.CategoryIds).NotEmpty();
        RuleFor(x => x).Must(x => x.StartDate <= x.EndDate)
            .WithMessage("Start date must be before end date.");
    }
}

public class CreateAIConversationRequestValidator : AbstractValidator<CreateAIConversationRequestDto>
{
    public CreateAIConversationRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
    }
}

public class AddAIMessageRequestValidator : AbstractValidator<AddAIMessageRequestDto>
{
    public AddAIMessageRequestValidator()
    {
        RuleFor(x => x.Content).NotEmpty().MaximumLength(4000);
    }
}
