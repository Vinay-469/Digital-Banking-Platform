using Bank.LoanService.Api.Application;
using Bank.LoanService.Api.Domain;

namespace Bank.LoanService.Api.Api;

public static class LoanEndpoints
{
    public static void MapLoanEndpoints(this WebApplication app)
    {
        app.MapGet("/api/Loans/user/{userId:int}", (int userId, LoanUseCases useCases) =>
            Results.Ok(useCases.GetByUserId(userId)));

        app.MapGet("/api/Loans/pending", (LoanUseCases useCases) =>
            Results.Ok(new { status = true, data = useCases.GetPending() }));

        app.MapPost("/api/Loans/apply", (Loan loan, LoanUseCases useCases) =>
            Results.Ok(new { status = true, data = useCases.Add(loan), message = "Loan application submitted" }));

        app.MapPut("/api/Loans/process/{loanId:long}", (long loanId, string status, LoanUseCases useCases) =>
            useCases.Process(loanId, status)
                ? Results.Ok("Loan application processed")
                : Results.NotFound("Loan application not found"));
    }
}
