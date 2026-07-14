using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using FluentValidation;
using HomeEmergency.Application.DTOs.ServiceRequests;

namespace HomeEmergency.Application.Validators;

public class UpdateServiceRequestValidator : AbstractValidator<UpdateServiceRequestDto>
{
    public UpdateServiceRequestValidator()
    {
        RuleFor(x => x.Description)
            .NotEmpty()
            .MaximumLength(1000);

        RuleFor(x => x.Address)
            .NotEmpty()
            .MaximumLength(300);

        RuleFor(x => x.RequiredProviders)
            .GreaterThan(0);
    }
}