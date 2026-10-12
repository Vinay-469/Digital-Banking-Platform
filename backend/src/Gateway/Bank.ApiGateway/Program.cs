using System.Net.Http.Headers;
using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:4200",
                "https://localhost:4200",
                "http://localhost:4300",
                "https://localhost:4300")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddHttpClient();
builder.Services.AddSignalR();

var app = builder.Build();

app.UseCors("Frontend");

app.MapGet("/", () => Results.Redirect("http://localhost:4300", permanent: false));

app.MapGet("/routes", () => Results.Ok(new
{
    name = "Bank API Gateway",
    routes = new[]
    {
        "Identity: /api/User, /api/Address, /api/kyc",
        "Branches: /api/Branches",
        "Accounts: /api/account, /GetAllAccountTypes, /available/{userId}",
        "Cards: /api/Cards",
        "Transactions: /api/Transactions",
        "Notifications: /api/Notifications, /api/otp",
        "Loans: /api/Loans",
        "Support: /api/chat"
    }
}));

app.MapGet("/health", () => Results.Ok(new { status = "ok", service = "gateway" }));
app.MapHub<TransactionHub>("/transactionHub");

app.Map("{**path}", async (
    HttpContext context,
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration) =>
{
    var targetBaseUrl = ResolveTarget(context.Request.Path, configuration);
    if (targetBaseUrl is null)
    {
        context.Response.StatusCode = StatusCodes.Status404NotFound;
        await context.Response.WriteAsync("No microservice route configured for this path.");
        return;
    }

    var client = httpClientFactory.CreateClient("gateway-proxy");
    var targetUri = new Uri($"{targetBaseUrl.TrimEnd('/')}{context.Request.Path}{context.Request.QueryString}");

    using var requestMessage = new HttpRequestMessage(new HttpMethod(context.Request.Method), targetUri);

    foreach (var header in context.Request.Headers)
    {
        if (string.Equals(header.Key, "Host", StringComparison.OrdinalIgnoreCase))
        {
            continue;
        }

        requestMessage.Headers.TryAddWithoutValidation(header.Key, header.Value.ToArray());
    }

    if (context.Request.ContentLength > 0 || context.Request.Headers.ContainsKey("Transfer-Encoding"))
    {
        requestMessage.Content = new StreamContent(context.Request.Body);
        if (!string.IsNullOrWhiteSpace(context.Request.ContentType))
        {
            requestMessage.Content.Headers.ContentType = MediaTypeHeaderValue.Parse(context.Request.ContentType);
        }
    }

    using var responseMessage = await client.SendAsync(
        requestMessage,
        HttpCompletionOption.ResponseHeadersRead,
        context.RequestAborted);

    context.Response.StatusCode = (int)responseMessage.StatusCode;

    foreach (var header in responseMessage.Headers)
    {
        context.Response.Headers[header.Key] = header.Value.ToArray();
    }

    foreach (var header in responseMessage.Content.Headers)
    {
        context.Response.Headers[header.Key] = header.Value.ToArray();
    }

    context.Response.Headers.Remove("transfer-encoding");
    await responseMessage.Content.CopyToAsync(context.Response.Body, context.RequestAborted);
});

app.Run();

static string? ResolveTarget(PathString requestPath, IConfiguration configuration)
{
    var path = requestPath.Value ?? "/";
    var services = configuration.GetSection("Services");

    if (path.StartsWith("/api/User", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/api/Address", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/api/kyc", StringComparison.OrdinalIgnoreCase))
    {
        return services["Identity"];
    }

    if (path.StartsWith("/api/Branches", StringComparison.OrdinalIgnoreCase))
    {
        return services["Branches"];
    }

    if (path.StartsWith("/api/account", StringComparison.OrdinalIgnoreCase) ||
        path.Equals("/GetAllAccountTypes", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/available/", StringComparison.OrdinalIgnoreCase))
    {
        return services["Accounts"];
    }

    if (path.StartsWith("/api/Cards", StringComparison.OrdinalIgnoreCase))
    {
        return services["Cards"];
    }

    if (path.StartsWith("/api/Transactions", StringComparison.OrdinalIgnoreCase))
    {
        return services["Transactions"];
    }

    if (path.StartsWith("/api/Notifications", StringComparison.OrdinalIgnoreCase) ||
        path.StartsWith("/api/otp", StringComparison.OrdinalIgnoreCase))
    {
        return services["Notifications"];
    }

    if (path.StartsWith("/api/Loans", StringComparison.OrdinalIgnoreCase))
    {
        return services["Loans"];
    }

    if (path.StartsWith("/api/chat", StringComparison.OrdinalIgnoreCase))
    {
        return services["Support"];
    }

    return null;
}

public sealed class TransactionHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var userId = Context.GetHttpContext()?.Request.Query["userId"].ToString();
        if (!string.IsNullOrWhiteSpace(userId))
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId}");
        }

        await base.OnConnectedAsync();
    }
}
