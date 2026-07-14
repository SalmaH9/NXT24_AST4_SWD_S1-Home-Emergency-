using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;
using HomeEmergency.Application.DTOs.ProviderOffers;

namespace HomeEmergency.Application.Validators;

public class CreateProviderOfferValidator : AbstractValidator<CreateProviderOfferDto>
{
    public CreateProviderOfferValidator()
    {
        RuleFor(x => x.ServiceRequestId)
            .NotEmpty();

        RuleFor(x => x.Price)
            .GreaterThan(0);

        RuleFor(x => x.Notes)
            .MaximumLength(500);
    }
}