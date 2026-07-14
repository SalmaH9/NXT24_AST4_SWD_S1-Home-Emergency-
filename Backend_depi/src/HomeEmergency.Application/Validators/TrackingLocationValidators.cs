using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using FluentValidation;
using HomeEmergency.Application.DTOs.TrackingLocations;

namespace HomeEmergency.Application.Validators;

public class AddTrackingLocationValidator : AbstractValidator<AddTrackingLocationDto>
{
    public AddTrackingLocationValidator()
    {
        RuleFor(x => x.ServiceExecutionId)
            .NotEmpty();

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90.0, 90.0)
            .WithMessage("Latitude must be between -90 and 90.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180.0, 180.0)
            .WithMessage("Longitude must be between -180 and 180.");
    }
}
