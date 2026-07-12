using FluentValidation;
using System.Linq;
using HomeEmergency.Application.DTOs.Admin;

namespace HomeEmergency.Application.Validators;

public class UserSearchFilterValidator : AbstractValidator<UserSearchFilterDto>
{
    private static readonly string[] AllowedSortColumns = new[] { "CreatedAt", "FullName", "Email", "Status" };

    public UserSearchFilterValidator()
    {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1).WithMessage("Page number must be at least 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("Page size must be between 1 and 100.");

        RuleFor(x => x.SortBy)
            .Must(sortBy => string.IsNullOrEmpty(sortBy) || AllowedSortColumns.Contains(sortBy))
            .WithMessage($"SortBy can only be one of the following: {string.Join(", ", AllowedSortColumns)}");
    }
}

