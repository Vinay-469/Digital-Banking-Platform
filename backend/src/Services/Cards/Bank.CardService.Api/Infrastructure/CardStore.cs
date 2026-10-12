using Bank.CardService.Api.Domain;

namespace Bank.CardService.Api.Infrastructure;

public sealed class CardStore
{
    private readonly object syncRoot = new();
    private int nextApplicationId = 6002;
    private int nextCardId = 5002;
    private long nextCardNumber = 1000000000000003;

    public CardStore()
    {
        CardTypes.AddRange(new[]
        {
            new CardType { CardTypeId = 1, CardTypeName = "Debit", Network = "Visa", DefaultLimit = 25000, MaxLimit = 100000 },
            new CardType { CardTypeId = 2, CardTypeName = "Debit", Network = "MasterCard", DefaultLimit = 30000, MaxLimit = 125000 },
            new CardType { CardTypeId = 3, CardTypeName = "Debit", Network = "RuPay", DefaultLimit = 20000, MaxLimit = 75000 }
        });

        var user = new UserSnapshot
        {
            UserId = 2000000,
            FullName = "Demo Customer",
            Email = "customer@example.invalid",
            Phone = "0000000001",
            DateOfBirth = new DateTime(2000, 1, 1)
        };

        var account = new AccountSnapshot
        {
            AccountId = 1000,
            AccountNumber = 100000000001,
            Balance = 65000,
            AccountStatus = 1,
            User = user,
            AccountType = new AccountTypeSnapshot { AccountTypeId = 4000, AccountTypeName = "Savings Account" }
        };

        var pendingAccount = new AccountSnapshot
        {
            AccountId = 1001,
            AccountNumber = 100000000002,
            Balance = 42000,
            AccountStatus = 1,
            User = user,
            AccountType = new AccountTypeSnapshot { AccountTypeId = 4002, AccountTypeName = "Salary Account" }
        };

        Accounts.AddRange(new[] { account, pendingAccount });

        Cards.Add(new Card
        {
            CardId = 5000,
            UserId = user.UserId,
            AccountId = account.AccountId,
            Account = account,
            CardTypeId = 1,
            CardType = CardTypes[0],
            CardNumber = 1000000000000001,
            IssueDate = DateTime.UtcNow.AddMonths(-8),
            ExpiryDate = DateTime.UtcNow.AddYears(4),
            Cvv = System.Security.Cryptography.RandomNumberGenerator.GetInt32(100, 1000),
            Status = 1,
            WithdrawLimit = 25000,
            AvailableCredit = 0,
            Pin = System.Security.Cryptography.RandomNumberGenerator.GetInt32(1000, 10000)
        });

        Applications.Add(new DebitCardApplication
        {
            ApplicationId = 6000,
            AccountId = pendingAccount.AccountId,
            Account = pendingAccount,
            UserId = pendingAccount.User.UserId,
            CommunicationAddress = "Demo address, Example Street",
            AppliedDate = DateTime.UtcNow.AddDays(-2),
            ApplicationStatus = "Pending",
            CardType = "MasterCard"
        });
    }

    public List<AccountSnapshot> Accounts { get; } = new();
    public List<CardType> CardTypes { get; } = new();
    public List<Card> Cards { get; } = new();
    public List<DebitCardApplication> Applications { get; } = new();

    public DebitCardApplication AddApplication(ApplyDebitCardDto dto)
    {
        lock (syncRoot)
        {
            var account = Accounts.FirstOrDefault(candidate => candidate.AccountNumber == dto.AccountNumber)
                ?? Accounts[0];

            var application = new DebitCardApplication
            {
                ApplicationId = nextApplicationId++,
                AccountId = account.AccountId,
                Account = account,
                UserId = account.User.UserId,
                CommunicationAddress = dto.CommunicationAddress,
                CardType = dto.CardType,
                AppliedDate = DateTime.UtcNow,
                ApplicationStatus = "Pending"
            };

            Applications.Add(application);
            return application;
        }
    }

    public Card IssueCard(DebitCardApplication application)
    {
        lock (syncRoot)
        {
            var selectedType = CardTypes.FirstOrDefault(type =>
                string.Equals(type.Network, application.CardType, StringComparison.OrdinalIgnoreCase))
                ?? CardTypes[0];

            var card = new Card
            {
                CardId = nextCardId++,
                UserId = application.UserId,
                AccountId = application.AccountId,
                Account = application.Account,
                CardTypeId = selectedType.CardTypeId,
                CardType = selectedType,
                CardNumber = nextCardNumber++,
                IssueDate = DateTime.UtcNow,
                ExpiryDate = DateTime.UtcNow.AddYears(4),
                Cvv = Random.Shared.Next(100, 999),
                Status = 1,
                WithdrawLimit = selectedType.DefaultLimit,
                Pin = System.Security.Cryptography.RandomNumberGenerator.GetInt32(1000, 10000)
            };

            Cards.Add(card);
            return card;
        }
    }
}
