using HomeEmergency.Application;
using HomeEmergency.Infrastructure;
using HomeEmergency.API.Extensions;
using HomeEmergency.API.Filters;
using HomeEmergency.API.Hubs;
using HomeEmergency.API.Middleware;
using HomeEmergency.API.Services;
using HomeEmergency.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddUserSecrets<Program>(optional: true);

// 1. Add Layered Projects and Extensions Services
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSwaggerDocumentation();
builder.Services.AddProblemDetails();
builder.Services.AddSignalR();
builder.Services.AddScoped<IRealTimeChatDispatcher, RealTimeChatDispatcher>();
builder.Services.AddScoped<IRealTimeNotificationDispatcher, RealTimeNotificationDispatcher>();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 2. Add API Controllers support
builder.Services.AddScoped<ValidationActionFilter>();
builder.Services.AddControllers(options =>
{
    options.Filters.AddService<ValidationActionFilter>();
});
builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var problemDetails = new ValidationProblemDetails(context.ModelState)
        {
            Status = StatusCodes.Status400BadRequest,
            Title = "Validation failed",
            Detail = "One or more validation errors occurred.",
            Instance = context.HttpContext.Request.Path
        };

        return new BadRequestObjectResult(problemDetails);
    };
});
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseMiddleware<ExceptionHandlingMiddleware>();

// 3. Configure HTTP pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "HomeEmergency API v1");
    });
}

app.UseHttpsRedirection();

// Public files such as advertisement media can still be served from wwwroot.
app.UseStaticFiles();

app.UseCors("AllowFrontend");

// 5. Authentication & Authorization Middleware
app.UseAuthentication();
app.UseAuthorization();

// 6. Map Controller routes
app.MapControllers();
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();

