using Bank.TransactionService.Api.Application;
using Bank.TransactionService.Api.Domain;

namespace Bank.TransactionService.Api.Api;

public static class TransactionEndpoints
{
    public static void MapTransactionEndpoints(this WebApplication app)
    {
        app.MapGet("/api/Transactions/user/{userId:int}", (int userId, TransactionUseCases useCases) =>
            Results.Ok(useCases.GetByUserId(userId)));

        app.MapGet("/api/Transactions/recentTransaction", (int userId, TransactionUseCases useCases) =>
            Results.Ok(useCases.GetRecentTransactions(userId)));

        app.MapGet("/api/Transactions/filter", (int userId, bool type, DateTime? fromDate, DateTime? toDate, TransactionUseCases useCases) =>
            Results.Ok(useCases.FilterTransactions(userId, type, fromDate, toDate)));

        app.MapGet("/api/Transactions/search", (int userId, string keyword, TransactionUseCases useCases) =>
            Results.Ok(useCases.SearchTransactions(userId, keyword)));

        app.MapPost("/api/Transactions/transfer", (TransactionDto dto, TransactionUseCases useCases) =>
            Results.Ok(new { success = true, data = useCases.CreateTransaction(dto) }));

        app.MapPost("/api/Transactions/add", (Transaction transaction, TransactionUseCases useCases) =>
        {
            var created = useCases.CreateTransaction(new TransactionDto
            {
                AccountId = transaction.AccountId,
                Amount = transaction.Amount,
                ReferenceAccountId = transaction.ReferenceAccountId,
                TransactionType = transaction.TransactionType
            });

            return Results.Ok(new { success = true, message = "Transaction logged successfully", data = created });
        });

        app.MapGet("/api/Transactions/{id:long}", (long id, TransactionUseCases useCases) =>
        {
            var transaction = useCases.GetByTransactionId(id);
            return transaction is null ? Results.NotFound("Transaction not found") : Results.Ok(transaction);
        });

        app.MapGet("/api/Transactions/mini-statement/download", (int accountId, DateTime fromDate, DateTime toDate, TransactionUseCases useCases) =>
        {
            if (fromDate > toDate)
            {
                return Results.BadRequest("Invalid date range");
            }

            if ((toDate - fromDate).TotalDays > 90)
            {
                return Results.BadRequest("Maximum allowed range is 90 days");
            }

            var bytes = useCases.GenerateMiniStatement(accountId, fromDate, toDate);
            return Results.File(bytes, "application/pdf", $"MiniStatement_{accountId}_{fromDate:yyyyMMdd}_{toDate:yyyyMMdd}.pdf");
        });
    }
}
