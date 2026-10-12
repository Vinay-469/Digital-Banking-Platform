using Bank.AccountService.Api.Application;
using Bank.AccountService.Api.Domain;

namespace Bank.AccountService.Api.Api;

public static class AccountEndpoints
{
    public static void MapAccountEndpoints(this WebApplication app)
    {
        app.MapGet("/GetAllAccountTypes", (AccountUseCases useCases) =>
            Results.Ok(new GenericResponse { Status = true, Data = useCases.GetAllAccountTypes() }));

        app.MapGet("/available/{userId:int}", (int userId, AccountUseCases useCases) =>
            Results.Ok(new GenericResponse { Status = true, Data = useCases.GetAvailableAccountTypes(userId) }));

        app.MapGet("/api/account/GetAllAccounts", (AccountUseCases useCases) =>
            Results.Ok(new GenericResponse { Status = true, Data = useCases.GetActiveAccounts(2000000) }));

        app.MapGet("/api/account/GetPendingApplications", (int managerId, AccountUseCases useCases) =>
            Results.Ok(useCases.GetPendingApplications(managerId)));

        app.MapGet("/api/account/GetAccountDetailsByUserId/{userId:int}", (int userId, AccountUseCases useCases) =>
            Results.Ok(new { status = true, data = useCases.GetAccountDetailsByUserId(userId) }));

        app.MapGet("/api/account/GetAccount/{userId:int}&{accountType:int}", (int userId, int accountType, AccountUseCases useCases) =>
        {
            var account = useCases.GetAccountByUserAndType(userId, accountType);
            return account is null ? Results.NotFound("Account not found") : Results.Ok(account);
        });

        app.MapGet("/api/account/GetAccountByAccountNumber", (long accountNumber, AccountUseCases useCases) =>
        {
            var account = useCases.GetAccountByNumber(accountNumber);
            return account is null
                ? Results.Ok(new GenericResponse { Status = false, Message = "Account not found!" })
                : Results.Ok(new GenericResponse { Status = true, Data = account, Message = "Account found" });
        });

        app.MapPost("/api/account/AddAccounts", (int userId, int branchId, int accountTypeId, AccountUseCases useCases) =>
            Results.Ok(new GenericResponse
            {
                Status = true,
                Data = useCases.AddAccount(userId, branchId, accountTypeId),
                Message = "Account added successfully!"
            }));

        app.MapGet("/api/account/CheckBalance", (int accountId, string pin, AccountUseCases useCases) =>
        {
            try
            {
                return Results.Ok(new GenericResponse { Status = true, Data = useCases.CheckBalance(accountId, pin).ToString("0.00") });
            }
            catch (Exception ex)
            {
                return Results.Ok(new GenericResponse { Status = false, Message = ex.Message });
            }
        });

        app.MapPut("/api/account/ApprovalState", (int accountId, int status, AccountUseCases useCases) =>
            useCases.ApproveAccount(accountId, status)
                ? Results.Ok("User status updated successfully")
                : Results.NotFound("User not found"));

        app.MapGet("/api/account/GetByAccountAndIfsc", (long accountNumber, string IFSCcode, AccountUseCases useCases) =>
        {
            var account = useCases.GetByAccountAndIfsc(accountNumber, IFSCcode);
            return account is null
                ? Results.Ok(new GenericResponse { Status = false, Message = "Account not found!" })
                : Results.Ok(new GenericResponse { Status = true, Data = account.User.FullName, Message = "Account found" });
        });

        app.MapPost("/api/account/transfer", (long fromAccount, long toAccount, decimal amount, AccountUseCases useCases) =>
        {
            var result = useCases.Transfer(fromAccount, toAccount, amount);
            return result.Success ? Results.Ok(result.Message) : Results.BadRequest(result.Message);
        });

        app.MapGet("/api/account/active/{userId:int}", (int userId, AccountUseCases useCases) =>
        {
            var accounts = useCases.GetActiveAccounts(userId);
            return accounts.Count == 0 ? Results.NotFound("No active accounts found") : Results.Ok(accounts);
        });

        app.MapPut("/api/account/setThreshold", (int accountId, int threshold, AccountUseCases useCases) =>
            useCases.SetThreshold(accountId, threshold)
                ? Results.Ok("Threshold updated successfully")
                : Results.NotFound("Threshold is not set"));

        app.MapPut("/api/account/accountControl", (int accountId, int status, AccountUseCases useCases) =>
            Results.Ok(useCases.UpdateAccountLockStatus(accountId, status)));
    }
}
