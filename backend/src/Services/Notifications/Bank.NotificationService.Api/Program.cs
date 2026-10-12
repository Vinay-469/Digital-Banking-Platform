using Bank.NotificationService.Api.Api;
using Bank.NotificationService.Api.Application;
using Bank.NotificationService.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Local", policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

builder.Services.AddSingleton<NotificationStore>();
builder.Services.AddSingleton<NotificationUseCases>();

var app = builder.Build();

app.UseCors("Local");
app.MapGet("/", () => Results.Redirect("http://localhost:4300", permanent: false));
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "notification-service" }));
app.MapNotificationEndpoints();

app.Run();
