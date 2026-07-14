using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using FluentValidation;
using HomeEmergency.Application.DTOs.ServiceExecutions;

namespace HomeEmergency.Application.Validators;

public class StartServiceExecutionValidator : AbstractValidator<StartServiceExecutionDto>
{
    public StartServiceExecutionValidator()
    {
        RuleFor(x => x.ServiceRequestId)
            .NotEmpty();
    }
}

public class CompleteServiceExecutionValidator : AbstractValidator<CompleteServiceExecutionDto>
{
    public CompleteServiceExecutionValidator()
    {
        RuleFor(x => x.ServiceExecutionId)
            .NotEmpty();
    }
}
