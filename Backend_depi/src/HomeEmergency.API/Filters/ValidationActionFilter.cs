using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.DependencyInjection;

namespace HomeEmergency.API.Filters;

public class ValidationActionFilter : IAsyncActionFilter
{
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        foreach (var argument in context.ActionArguments.Values.Where(x => x is not null))
        {
            var validatorType = typeof(IValidator<>).MakeGenericType(argument!.GetType());
            var validator = context.HttpContext.RequestServices.GetService(validatorType);
            if (validator is null)
            {
                continue;
            }

            var validationContext = new ValidationContext<object>(argument);
            var validationResult = await ((IValidator)validator).ValidateAsync(validationContext);
            if (!validationResult.IsValid)
            {
                foreach (var error in validationResult.Errors)
                {
                    context.ModelState.AddModelError(error.PropertyName, error.ErrorMessage);
                }
            }
        }

        if (!context.ModelState.IsValid)
        {
            return;
        }

        await next();
    }
}
