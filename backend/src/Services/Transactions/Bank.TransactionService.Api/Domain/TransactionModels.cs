namespace Bank.TransactionService.Api.Domain;

public sealed class Transaction
{
    public long TransactionId { get; set; }
    public int UserId { get; set; }
    public int AccountId { get; set; }
    public AccountSnapshot Account { get; set; } = new();
    public decimal Amount { get; set; }
    public DateTime TransactionDate { get; set; } = DateTime.UtcNow;
    public string? Status { get; set; }
    public int? ReferenceAccountId { get; set; }
    public AccountSnapshot? ReferenceAccount { get; set; }
    public bool TransactionType { get; set; }
}

public sealed class TransactionDto
{
    public int AccountId { get; set; }
    public decimal Amount { get; set; }
    public int? ReferenceAccountId { get; set; }
    public bool TransactionType { get; set; }
}

public sealed class AccountSnapshot
{
    public int AccountId { get; set; }
    public long AccountNumber { get; set; }
    public decimal Balance { get; set; }
    public int AccountStatus { get; set; } = 1;
    public int IsLocked { get; set; }
    public UserSnapshot User { get; set; } = new();
    public AccountTypeSnapshot AccountType { get; set; } = new();
}

public sealed class UserSnapshot
{
    public int UserId { get; set; }
    public string FullName { get; set; } = "";
}

public sealed class AccountTypeSnapshot
{
    public int AccountTypeId { get; set; }
    public string AccountTypeName { get; set; } = "";
}
