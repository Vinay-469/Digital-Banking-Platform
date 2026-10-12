using Bank.TransactionService.Api.Api;
using Bank.TransactionService.Api.Application;
using Bank.TransactionService.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Local", policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

builder.Services.AddSingleton<TransactionStore>();
builder.Services.AddSingleton<TransactionUseCases>();

var app = builder.Build();

app.UseCors("Local");
app.MapGet("/", () => Results.Redirect("http://localhost:4300", permanent: false));
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "transaction-service" }));
app.MapTransactionEndpoints();

app.Run();
