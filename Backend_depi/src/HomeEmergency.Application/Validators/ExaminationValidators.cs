using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using FluentValidation;
using HomeEmergency.Application.DTOs.Examinations;

namespace HomeEmergency.Application.Validators;

public class CreateExaminationValidator : AbstractValidator<CreateExaminationDto>
{
    public CreateExaminationValidator()
    {
        RuleFor(x => x.ServiceRequestId)
            .NotEmpty();

        RuleFor(x => x.Report)
            .NotEmpty()
            .MaximumLength(2000);

        RuleFor(x => x.EstimatedPrice)
            .GreaterThan(0);
    }
}

public class ApproveExaminationValidator : AbstractValidator<ApproveExaminationDto>
{
    public ApproveExaminationValidator()
    {
        RuleFor(x => x.IsApproved)
            .NotNull();
    }
}
