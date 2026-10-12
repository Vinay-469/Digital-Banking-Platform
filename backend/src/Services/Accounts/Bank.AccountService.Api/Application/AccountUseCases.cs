using Bank.AccountService.Api.Domain;
using Bank.AccountService.Api.Infrastructure;

namespace Bank.AccountService.Api.Application;

public sealed class AccountUseCases
{
    private readonly AccountStore store;

    public AccountUseCases(AccountStore store)
    {
        this.store = store;
    }

    public IReadOnlyList<AccountType> GetAllAccountTypes() => store.AccountTypes;

    public IReadOnlyList<object> GetAvailableAccountTypes(int userId)
    {
        var ownedTypes = store.Accounts.Where(account => account.UserId == userId).Select(account => account.AccountTypeId).ToHashSet();
        return store.AccountTypes
            .Where(type => !ownedTypes.Contains(type.AccountTypeId))
            .Select(type => new { type.AccountTypeId, type.AccountTypeName })
            .Cast<object>()
            .ToList();
    }

    public IReadOnlyList<Account> GetPendingApplications(int managerId)
    {
        return store.Accounts.Where(account => account.AccountStatus == 0).ToList();
    }

    public IReadOnlyList<AccountDetailsDto> GetAccountDetailsByUserId(int userId)
    {
        return store.Accounts
            .Where(account => account.UserId == userId)
            .Select(ToDetails)
            .ToList();
    }

    public Account? GetAccountByUserAndType(int userId, int accountTypeId)
    {
        return store.Accounts.FirstOrDefault(account => account.UserId == userId && account.AccountTypeId == accountTypeId);
    }

    public Account? GetAccountByNumber(long accountNumber)
    {
        return store.Accounts.FirstOrDefault(account => account.AccountNumber == accountNumber);
    }

    public Account AddAccount(int userId, int branchId, int accountTypeId)
    {
        return store.AddAccount(userId, branchId, accountTypeId);
    }

    public bool ApproveAccount(int accountId, int status)
    {
        var account = store.Accounts.FirstOrDefault(candidate => candidate.AccountId == accountId);
        if (account is null)
        {
            return false;
        }

        account.AccountStatus = status;
        account.ModifiedOn = DateTime.UtcNow;
        return true;
    }

    public decimal CheckBalance(int accountId, string pin)
    {
        var account = store.Accounts.FirstOrDefault(candidate => candidate.AccountId == accountId);
        if (account is null)
        {
            throw new InvalidOperationException("Account not found");
        }

        if (string.IsNullOrWhiteSpace(account.Pin) || string.IsNullOrWhiteSpace(pin) || account.Pin != pin)
        {
            throw new InvalidOperationException("Invalid PIN");
        }

        return account.Balance;
    }

    public Account? GetByAccountAndIfsc(long accountNumber, string ifsc)
    {
        return store.Accounts.FirstOrDefault(account =>
            account.AccountNumber == accountNumber &&
            string.Equals(account.Branch.IfscCode, ifsc, StringComparison.OrdinalIgnoreCase));
    }

    public (bool Success, string Message) Transfer(long fromAccountNumber, long toAccountNumber, decimal amount)
    {
        var from = GetAccountByNumber(fromAccountNumber);
        var to = GetAccountByNumber(toAccountNumber);

        if (from is null || to is null)
        {
            return (false, "Account not found");
        }

        if (amount <= 0)
        {
            return (false, "Transfer amount must be greater than zero");
        }

        if (from.Balance < amount)
        {
            return (false, "Insufficient balance");
        }

        from.Balance -= amount;
        to.Balance += amount;
        from.ModifiedOn = DateTime.UtcNow;
        to.ModifiedOn = DateTime.UtcNow;
        return (true, "Transfer Successful");
    }

    public IReadOnlyList<Account> GetActiveAccounts(int userId)
    {
        return store.Accounts.Where(account => account.UserId == userId && account.AccountStatus == 1 && account.IsLocked == 0).ToList();
    }

    public bool SetThreshold(int accountId, int threshold)
    {
        var account = store.Accounts.FirstOrDefault(candidate => candidate.AccountId == accountId);
        if (account is null)
        {
            return false;
        }

        account.CustomThreshold = threshold;
        return true;
    }

    public string UpdateAccountLockStatus(int accountId, int status)
    {
        var account = store.Accounts.FirstOrDefault(candidate => candidate.AccountId == accountId);
        if (account is null)
        {
            return "Account not found";
        }

        if (status == 2)
        {
            account.AccountStatus = 0;
            account.ClosingDate = DateTime.UtcNow;
            return "Account closed successfully";
        }

        account.IsLocked = status;
        return status == 1 ? "Account locked successfully" : "Account unlocked successfully";
    }

    private static AccountDetailsDto ToDetails(Account account)
    {
        return new AccountDetailsDto
        {
            AccountId = account.AccountId,
            AccountNumber = account.AccountNumber,
            Balance = account.Balance,
            AccountStatus = account.AccountStatus,
            IsLocked = account.IsLocked,
            CreatedOn = account.CreatedOn,
            CreatedBy = account.CreatedBy,
            ClosingDate = account.ClosingDate,
            Threshold = account.AccountType.Threshold,
            UserId = account.UserId,
            FullName = account.User.FullName,
            BranchId = account.BranchId,
            BranchName = account.Branch.BranchName,
            IfscCode = account.Branch.IfscCode,
            City = account.Branch.City,
            AccountTypeName = account.AccountType.AccountTypeName,
            InterestRate = account.AccountType.InterestRate,
            CustomThreshold = account.CustomThreshold
        };
    }
}
