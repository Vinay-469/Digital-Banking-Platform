using Bank.IdentityService.Api.Api;
using Bank.IdentityService.Api.Application;
using Bank.IdentityService.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Local", policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

builder.Services.AddSingleton<IdentityStore>();
builder.Services.AddSingleton<IdentityUseCases>();

var app = builder.Build();

app.UseCors("Local");
app.MapGet("/", () => Results.Redirect("http://localhost:4300", permanent: false));
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "identity-service" }));
app.MapIdentityEndpoints();

app.Run();
