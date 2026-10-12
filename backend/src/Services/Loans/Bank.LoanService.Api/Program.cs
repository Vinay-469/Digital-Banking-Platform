using Bank.LoanService.Api.Api;
using Bank.LoanService.Api.Application;
using Bank.LoanService.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Local", policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

builder.Services.AddSingleton<LoanStore>();
builder.Services.AddSingleton<LoanUseCases>();

var app = builder.Build();

app.UseCors("Local");
app.MapGet("/", () => Results.Redirect("http://localhost:4300", permanent: false));
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "loan-service" }));
app.MapLoanEndpoints();

app.Run();
