using HomeEmergency.Application;
using HomeEmergency.Infrastructure;
using HomeEmergency.API.Extensions;
using HomeEmergency.API.Middleware;

var builder = WebApplication.CreateBuilder(args);

// 1. Add Layered Projects and Extensions Services
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddSwaggerDocumentation();

// 2. Add API Controllers support
builder.Services.AddControllers();
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

// 4. Enable Static Files Serving (Crucial for wwwroot/uploads)
app.UseStaticFiles();

// 5. Authentication & Authorization Middleware
app.UseAuthentication();
app.UseAuthorization();

// 6. Map Controller routes
app.MapControllers();

app.Run();

