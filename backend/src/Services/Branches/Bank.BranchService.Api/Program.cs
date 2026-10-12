using Bank.BranchService.Api.Api;
using Bank.BranchService.Api.Application;
using Bank.BranchService.Api.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Local", policy => policy.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
});

builder.Services.AddSingleton<BranchStore>();
builder.Services.AddSingleton<BranchUseCases>();

var app = builder.Build();

app.UseCors("Local");
app.MapGet("/", () => Results.Redirect("http://localhost:4300", permanent: false));
app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "branch-service" }));
app.MapBranchEndpoints();

app.Run();
