using Bank.CardService.Api.Application;
using Bank.CardService.Api.Domain;

namespace Bank.CardService.Api.Api;

public static class CardEndpoints
{
    public static void MapCardEndpoints(this WebApplication app)
    {
        app.MapPost("/api/Cards/apply", (ApplyDebitCardDto dto, CardUseCases useCases) =>
        {
            useCases.Apply(dto);
            return Results.Ok(new { message = "Application submitted successfully" });
        });

        app.MapGet("/api/Cards/pendingApplications", (CardUseCases useCases) =>
            Results.Ok(new { status = true, data = useCases.GetPendingApplications() }));

        app.MapGet("/api/Cards/{id:int}", (int id, CardUseCases useCases) =>
        {
            var application = useCases.GetApplicationById(id);
            return application is null
                ? Results.NotFound(new { status = false, message = "Application not found" })
                : Results.Ok(new { status = true, data = application });
        });

        app.MapPut("/api/Cards/process/{id:int}", (int id, string status, CardUseCases useCases) =>
        {
            try
            {
                return Results.Ok(useCases.ProcessApplication(id, status));
            }
            catch (Exception ex)
            {
                return Results.BadRequest(ex.Message);
            }
        });

        app.MapGet("/api/Cards/UserHasActiveCards/{userId:int}", (int userId, CardUseCases useCases) =>
            Results.Ok(useCases.UserHasActiveCards(userId)));

        app.MapGet("/api/Cards/user/activeCards", (int userId, CardUseCases useCases) =>
            Results.Ok(useCases.GetActiveCards(userId)));

        app.MapPut("/api/Cards/blockOrUnblock", (int cardId, int status, CardUseCases useCases) =>
            useCases.UpdateCardStatus(cardId, status)
                ? Results.Ok("Card status updated successfully.")
                : Results.BadRequest("Failed to update card status."));

        app.MapPost("/api/Cards/reset-pin", (long cardNumber, int cvv, int newPin, CardUseCases useCases) =>
            useCases.ResetPin(cardNumber, cvv, newPin)
                ? Results.Ok(new { message = "PIN reset successfully" })
                : Results.NotFound(new { message = "Card not found" }));

        app.MapPut("/api/Cards/set-withdraw-limit", (int cardId, decimal limit, CardUseCases useCases) =>
        {
            var result = useCases.SetWithdrawLimit(cardId, limit);
            return result == "Card not found" ? Results.NotFound(result) : Results.Ok(result);
        });
    }
}
