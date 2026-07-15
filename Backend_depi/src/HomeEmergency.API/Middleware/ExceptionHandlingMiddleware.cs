using System;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace HomeEmergency.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";

        var (statusCode, title) = MapStatus(exception);
        context.Response.StatusCode = (int)statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = (int)statusCode,
            Title = title,
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        if (_env.IsDevelopment())
        {
            problemDetails.Extensions["stackTrace"] = exception.StackTrace;
        }

        if (exception is ValidationException validationException)
        {
            problemDetails.Extensions["errors"] = validationException.Errors
                .GroupBy(x => x.PropertyName)
                .ToDictionary(
                    x => x.Key,
                    x => x.Select(e => e.ErrorMessage).ToArray());
        }

        var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        var json = JsonSerializer.Serialize(problemDetails, options);
        await context.Response.WriteAsync(json);
    }

    private static (HttpStatusCode StatusCode, string Title) MapStatus(Exception exception)
    {
        return exception switch
        {
            ValidationException => (HttpStatusCode.BadRequest, "Validation failed"),
            KeyNotFoundException => (HttpStatusCode.NotFound, "Resource not found"),
            ArgumentException => (HttpStatusCode.BadRequest, "Invalid request"),
            InvalidOperationException invalidOperationException when IsConflict(invalidOperationException.Message)
                => (HttpStatusCode.Conflict, "Conflict"),
            // أخطاء قاعدة البيانات مشكلة سيرفر (500) مش مشكلة بيانات المستخدم (400)
            InvalidOperationException ex when IsDatabaseFailure(ex.Message)
                => (HttpStatusCode.ServiceUnavailable, "Database unavailable"),
            InvalidOperationException => (HttpStatusCode.BadRequest, "Invalid operation"),
            UnauthorizedAccessException unauthorizedAccessException when IsForbidden(unauthorizedAccessException.Message)
                => (HttpStatusCode.Forbidden, "Forbidden"),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, "Unauthorized"),
            _ => (HttpStatusCode.InternalServerError, "Internal server error")
        };
    }

    private static bool IsConflict(string? message)
    {
        return !string.IsNullOrWhiteSpace(message) &&
               (message.Contains("already", StringComparison.OrdinalIgnoreCase) ||
                message.Contains("duplicate", StringComparison.OrdinalIgnoreCase) ||
                message.Contains("reuse", StringComparison.OrdinalIgnoreCase) ||
                message.Contains("conflict", StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsDatabaseFailure(string? message)
    {
        return !string.IsNullOrWhiteSpace(message) &&
               (message.Contains("transient failure", StringComparison.OrdinalIgnoreCase) ||
                message.Contains("EnableRetryOnFailure", StringComparison.OrdinalIgnoreCase) ||
                message.Contains("UseSqlServer", StringComparison.OrdinalIgnoreCase));
    }

    private static bool IsForbidden(string? message)
    {
        return !string.IsNullOrWhiteSpace(message) &&
               message.Contains("not allowed", StringComparison.OrdinalIgnoreCase);
    }
}

