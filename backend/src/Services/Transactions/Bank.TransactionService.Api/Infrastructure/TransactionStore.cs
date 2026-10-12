using Bank.TransactionService.Api.Domain;

namespace Bank.TransactionService.Api.Infrastructure;

public sealed class TransactionStore
{
    private readonly object syncRoot = new();
    private long nextTransactionId = 1000004;

    public TransactionStore()
    {
        var nancy = new UserSnapshot { UserId = 2000000, FullName = "Demo Customer" };
        var merchant = new UserSnapshot { UserId = 2000100, FullName = "Demo Merchant" };
        var savings = new AccountSnapshot
        {
            AccountId = 1000,
            AccountNumber = 100000000001,
            Balance = 65000,
            User = nancy,
            AccountType = new AccountTypeSnapshot { AccountTypeId = 4000, AccountTypeName = "Savings Account" }
        };
        var salary = new AccountSnapshot
        {
            AccountId = 1001,
            AccountNumber = 100000000002,
            Balance = 42000,
            User = nancy,
            AccountType = new AccountTypeSnapshot { AccountTypeId = 4002, AccountTypeName = "Salary Account" }
        };
        var merchantAccount = new AccountSnapshot
        {
            AccountId = 1999,
            AccountNumber = 100000000099,
            Balance = 0,
            User = merchant,
            AccountType = new AccountTypeSnapshot { AccountTypeId = 4999, AccountTypeName = "External Account" }
        };

        Accounts.AddRange(new[] { savings, salary, merchantAccount });

        Transactions.AddRange(new[]
        {
            new Transaction { TransactionId = 1000000, UserId = nancy.UserId, AccountId = savings.AccountId, Account = savings, Amount = 25000, TransactionDate = DateTime.UtcNow.AddDays(-10), Status = "Success", ReferenceAccountId = null, ReferenceAccount = null, TransactionType = true },
            new Transaction { TransactionId = 1000001, UserId = nancy.UserId, AccountId = savings.AccountId, Account = savings, Amount = 1850, TransactionDate = DateTime.UtcNow.AddDays(-7), Status = "Success", ReferenceAccountId = merchantAccount.AccountId, ReferenceAccount = merchantAccount, TransactionType = false },
            new Transaction { TransactionId = 1000002, UserId = nancy.UserId, AccountId = salary.AccountId, Account = salary, Amount = 42000, TransactionDate = DateTime.UtcNow.AddDays(-4), Status = "Success", ReferenceAccountId = null, ReferenceAccount = null, TransactionType = true },
            new Transaction { TransactionId = 1000003, UserId = nancy.UserId, AccountId = salary.AccountId, Account = salary, Amount = 5000, TransactionDate = DateTime.UtcNow.AddDays(-1), Status = "Success", ReferenceAccountId = savings.AccountId, ReferenceAccount = savings, TransactionType = false }
        });
    }

    public List<AccountSnapshot> Accounts { get; } = new();
    public List<Transaction> Transactions { get; } = new();

    public Transaction Add(TransactionDto dto)
    {
        lock (syncRoot)
        {
            var account = Accounts.First(candidate => candidate.AccountId == dto.AccountId);
            var reference = dto.ReferenceAccountId is null
                ? null
                : Accounts.FirstOrDefault(candidate => candidate.AccountId == dto.ReferenceAccountId.Value);

            var transaction = new Transaction
            {
                TransactionId = nextTransactionId++,
                UserId = account.User.UserId,
                AccountId = account.AccountId,
                Account = account,
                Amount = dto.Amount,
                TransactionDate = DateTime.UtcNow,
                Status = "Success",
                ReferenceAccountId = reference?.AccountId,
                ReferenceAccount = reference,
                TransactionType = dto.TransactionType
            };

            Transactions.Insert(0, transaction);
            return transaction;
        }
    }
}
