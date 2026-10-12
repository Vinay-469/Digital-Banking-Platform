namespace Bank.CardService.Api.Domain;

public sealed class ApplyDebitCardDto
{
    public long AccountNumber { get; set; }
    public string CardType { get; set; } = "";
    public string CommunicationAddress { get; set; } = "";
}

public sealed class CardType
{
    public int CardTypeId { get; set; }
    public string CardTypeName { get; set; } = "";
    public string Network { get; set; } = "";
    public decimal DefaultLimit { get; set; }
    public decimal MaxLimit { get; set; }
}

public sealed class Card
{
    public int CardId { get; set; }
    public int UserId { get; set; }
    public int AccountId { get; set; }
    public AccountSnapshot Account { get; set; } = new();
    public int CardTypeId { get; set; }
    public CardType CardType { get; set; } = new();
    public long CardNumber { get; set; }
    public DateTime IssueDate { get; set; }
    public DateTime ExpiryDate { get; set; }
    public int Cvv { get; set; }
    public int Status { get; set; } = 1;
    public decimal WithdrawLimit { get; set; }
    public decimal AvailableCredit { get; set; }
    public int Pin { get; set; }
}

public sealed class DebitCardApplication
{
    public int ApplicationId { get; set; }
    public int AccountId { get; set; }
    public AccountSnapshot Account { get; set; } = new();
    public int UserId { get; set; }
    public string CommunicationAddress { get; set; } = "";
    public DateTime AppliedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedDate { get; set; }
    public string ApplicationStatus { get; set; } = "Pending";
    public string CardType { get; set; } = "";
}

public sealed class AccountSnapshot
{
    public int AccountId { get; set; }
    public long AccountNumber { get; set; }
    public decimal Balance { get; set; }
    public int AccountStatus { get; set; }
    public UserSnapshot User { get; set; } = new();
    public AccountTypeSnapshot AccountType { get; set; } = new();
}

public sealed class AccountTypeSnapshot
{
    public int AccountTypeId { get; set; }
    public string AccountTypeName { get; set; } = "";
}

public sealed class UserSnapshot
{
    public int UserId { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public DateTime? DateOfBirth { get; set; }
}
