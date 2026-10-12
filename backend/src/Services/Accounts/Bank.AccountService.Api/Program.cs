using Bank.AccountService.Api.Api;
using Bank.AccountService.Api.Application;
using Bank.AccountService.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Local", policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

builder.Services.AddSingleton<AccountStore>();
builder.Services.AddSingleton<AccountUseCases>();

var app = builder.Build();

app.UseCors("Local");
app.MapGet("/", () => Results.Redirect("http://localhost:4300", permanent: false));
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "account-service" }));
app.MapAccountEndpoints();

app.Run();
