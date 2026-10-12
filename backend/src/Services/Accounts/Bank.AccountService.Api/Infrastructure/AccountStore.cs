using Bank.AccountService.Api.Domain;

namespace Bank.AccountService.Api.Infrastructure;

public sealed class AccountStore
{
    private readonly object syncRoot = new();
    private int nextAccountId = 1003;
    private long nextAccountNumber = 100000000004;

    public AccountStore()
    {
        AccountTypes.AddRange(new[]
        {
            new AccountType { AccountTypeId = 4000, AccountTypeName = "Savings Account", InterestRate = 3.5m, OverdraftLimit = 0, Threshold = 1000 },
            new AccountType { AccountTypeId = 4001, AccountTypeName = "Current Account", InterestRate = 1.25m, OverdraftLimit = 50000, Threshold = 5000 },
            new AccountType { AccountTypeId = 4002, AccountTypeName = "Salary Account", InterestRate = 4.0m, OverdraftLimit = 10000, Threshold = 2000 }
        });

        var nancy = new UserSnapshot
        {
            UserId = 2000000,
            FullName = "Demo Customer",
            Email = "customer@example.invalid",
            Phone = "0000000001",
            Gender = "Female",
            DateOfBirth = new DateTime(2000, 1, 1),
            MaritalStatus = "Single",
            Occupation = "Engineer",
            DateJoined = DateTime.UtcNow.AddMonths(-8),
            Address = new AddressSnapshot { DoorNumber = "DEMO-1", Street = "Example Street", City = "Bengaluru", State = "Karnataka", Country = "India" },
            Kyc = new KycSnapshot { PanNumber = "DEMO-PAN-001", AdhaarNumber = "DEMO-AADHAAR-001" }
        };

        var pending = new UserSnapshot
        {
            UserId = 2000002,
            FullName = "Pending Applicant",
            Email = "pending@example.invalid",
            Phone = "0000000003",
            Gender = "Female",
            DateOfBirth = new DateTime(2000, 1, 3),
            MaritalStatus = "Single",
            Occupation = "Designer",
            DateJoined = DateTime.UtcNow.AddDays(-4),
            Address = new AddressSnapshot { DoorNumber = "DEMO-3", Street = "Example Street", City = "Hyderabad", State = "Telangana", Country = "India" },
            Kyc = new KycSnapshot { PanNumber = "DEMO-PAN-003", AdhaarNumber = "DEMO-AADHAAR-003" }
        };

        var bengaluru = new BranchSnapshot { BranchId = 1000, BranchName = "Bengaluru Central", City = "Bengaluru", IfscCode = "BANK0001000" };
        var chennai = new BranchSnapshot { BranchId = 1001, BranchName = "Chennai Main", City = "Chennai", IfscCode = "BANK0001001" };
        var hyderabad = new BranchSnapshot { BranchId = 1002, BranchName = "Hyderabad Tech Park", City = "Hyderabad", IfscCode = "BANK0001002" };

        Branches.AddRange(new[] { bengaluru, chennai, hyderabad });

        Accounts.AddRange(new[]
        {
            CreateSeedAccount(1000, 100000000001, nancy, bengaluru, AccountTypes[0], 65000m, 1, Environment.GetEnvironmentVariable("BANK_DEMO_ACCOUNT_PIN") ?? "", 5000),
            CreateSeedAccount(1001, 100000000002, nancy, chennai, AccountTypes[2], 42000m, 1, Environment.GetEnvironmentVariable("BANK_DEMO_ACCOUNT_PIN") ?? "", 2000),
            CreateSeedAccount(1002, 100000000003, pending, hyderabad, AccountTypes[0], 0m, 0, Environment.GetEnvironmentVariable("BANK_DEMO_ACCOUNT_PIN") ?? "", 1000)
        });
    }

    public List<AccountType> AccountTypes { get; } = new();
    public List<BranchSnapshot> Branches { get; } = new();
    public List<Account> Accounts { get; } = new();

    public Account AddAccount(int userId, int branchId, int accountTypeId)
    {
        lock (syncRoot)
        {
            var accountType = AccountTypes.First(type => type.AccountTypeId == accountTypeId);
            var branch = Branches.FirstOrDefault(candidate => candidate.BranchId == branchId) ?? Branches[0];
            var user = Accounts.FirstOrDefault(account => account.UserId == userId)?.User ?? new UserSnapshot
            {
                UserId = userId,
                FullName = $"Customer {userId}",
                Email = $"customer{userId}@example.invalid",
                Phone = "0000000004",
                DateJoined = DateTime.UtcNow
            };

            var account = CreateSeedAccount(
                nextAccountId++,
                nextAccountNumber++,
                user,
                branch,
                accountType,
                0m,
                0,
                Environment.GetEnvironmentVariable("BANK_DEMO_ACCOUNT_PIN") ?? "",
                accountType.Threshold);

            Accounts.Add(account);
            return account;
        }
    }

    private static Account CreateSeedAccount(
        int accountId,
        long accountNumber,
        UserSnapshot user,
        BranchSnapshot branch,
        AccountType accountType,
        decimal balance,
        int status,
        string pin,
        int customThreshold)
    {
        return new Account
        {
            AccountId = accountId,
            AccountNumber = accountNumber,
            UserId = user.UserId,
            User = user,
            BranchId = branch.BranchId,
            Branch = branch,
            Balance = balance,
            AccountStatus = status,
            AccountTypeId = accountType.AccountTypeId,
            AccountType = accountType,
            CreatedBy = "microservice-seed",
            CreatedOn = DateTime.UtcNow.AddDays(-30),
            CustomThreshold = customThreshold,
            Pin = pin
        };
    }
}
