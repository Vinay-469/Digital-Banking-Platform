using Bank.SupportService.Api.Application;
using Bank.SupportService.Api.Domain;

namespace Bank.SupportService.Api.Api;

public static class ChatEndpoints
{
    public static void MapChatEndpoints(this WebApplication app)
    {
        app.MapPost("/api/chat/ask", (ChatRequest request, ChatUseCases useCases) =>
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return Results.BadRequest("Invalid request");
            }

            return Results.Ok(new { response = useCases.Ask(request) });
        });
    }
}
