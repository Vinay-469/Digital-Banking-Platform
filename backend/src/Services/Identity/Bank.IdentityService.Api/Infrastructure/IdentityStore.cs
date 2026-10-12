using Bank.IdentityService.Api.Domain;

namespace Bank.IdentityService.Api.Infrastructure;

public sealed class IdentityStore
{
    private readonly object syncRoot = new();
    private int nextUserId = 2000003;
    private int nextAddressId = 303;
    private int nextKycId = 3003;

    public IdentityStore()
    {
        Addresses.AddRange(new[]
        {
            new Address { AddressId = 300, DoorNumber = "DEMO-1", Street = "Example Street", City = "Bengaluru", District = "Bengaluru", State = "Karnataka", Country = "India", PinCode = 560001 },
            new Address { AddressId = 301, DoorNumber = "DEMO-2", Street = "Example Street", City = "Chennai", District = "Chennai", State = "Tamil Nadu", Country = "India", PinCode = 600002 },
            new Address { AddressId = 302, DoorNumber = "DEMO-3", Street = "Example Street", City = "Hyderabad", District = "Hyderabad", State = "Telangana", Country = "India", PinCode = 500081 }
        });

        KycDocuments.AddRange(new[]
        {
            new KycDocument { KycId = 3000, PanNumber = "DEMO-PAN-001", AdhaarNumber = "DEMO-AADHAAR-001", SubmittedOn = DateTime.UtcNow.AddDays(-60), ApprovedOn = DateTime.UtcNow.AddDays(-58), KycStatus = true, AdhaarFile = "aadhaar-demo.pdf", PanFile = "pan-demo.pdf" },
            new KycDocument { KycId = 3001, PanNumber = "DEMO-PAN-002", AdhaarNumber = "DEMO-AADHAAR-002", SubmittedOn = DateTime.UtcNow.AddDays(-20), ApprovedOn = DateTime.UtcNow.AddDays(-19), KycStatus = true, AdhaarFile = "aadhaar-manager.pdf", PanFile = "pan-manager.pdf" },
            new KycDocument { KycId = 3002, PanNumber = "DEMO-PAN-003", AdhaarNumber = "DEMO-AADHAAR-003", SubmittedOn = DateTime.UtcNow.AddDays(-4), KycStatus = false }
        });

        Users.AddRange(new[]
        {
            new BankUser { UserId = 2000000, FullName = "Demo Customer", Email = "customer@example.invalid", Phone = "0000000001", AddressId = 300, Address = Addresses[0], KycId = 3000, Kyc = KycDocuments[0], Role = "User", Status = "Active", DateOfBirth = new DateTime(2000, 1, 1), Gender = "Female", DateJoined = DateTime.UtcNow.AddMonths(-8), Occupation = "Engineer", MaritalStatus = "Single", Password = Environment.GetEnvironmentVariable("BANK_DEMO_CUSTOMER_PASSWORD"), NetbankingStatus = true },
            new BankUser { UserId = 2000001, FullName = "Demo Manager", Email = "manager@example.invalid", Phone = "0000000002", AddressId = 301, Address = Addresses[1], KycId = 3001, Kyc = KycDocuments[1], Role = "Manager", Status = "Active", DateOfBirth = new DateTime(2000, 1, 2), Gender = "Male", DateJoined = DateTime.UtcNow.AddYears(-2), Occupation = "Bank Manager", MaritalStatus = "Married", Password = Environment.GetEnvironmentVariable("BANK_DEMO_MANAGER_PASSWORD"), NetbankingStatus = true },
            new BankUser { UserId = 2000002, FullName = "Demo Applicant", Email = "pending@example.invalid", Phone = "0000000003", AddressId = 302, Address = Addresses[2], KycId = 3002, Kyc = KycDocuments[2], Role = "User", Status = "Pending", DateOfBirth = new DateTime(2000, 1, 3), Gender = "Female", DateJoined = DateTime.UtcNow.AddDays(-4), Occupation = "Designer", MaritalStatus = "Single", Password = Environment.GetEnvironmentVariable("BANK_DEMO_PENDING_PASSWORD"), NetbankingStatus = false }
        });
    }

    public List<BankUser> Users { get; } = new();
    public List<Address> Addresses { get; } = new();
    public List<KycDocument> KycDocuments { get; } = new();

    public BankUser AddUser(BankUser user)
    {
        lock (syncRoot)
        {
            user.UserId = nextUserId++;

            if (user.Address is not null)
            {
                user.Address.AddressId = nextAddressId++;
                user.AddressId = user.Address.AddressId;
                Addresses.Add(user.Address);
            }

            if (user.Kyc is not null)
            {
                user.Kyc.KycId = nextKycId++;
                user.KycId = user.Kyc.KycId;
                user.Kyc.SubmittedOn = user.Kyc.SubmittedOn == default ? DateTime.UtcNow : user.Kyc.SubmittedOn;
                KycDocuments.Add(user.Kyc);
            }

            user.DateJoined ??= DateTime.UtcNow;
            user.Status ??= "Active";
            user.Role ??= "User";
            Users.Add(user);
            return user;
        }
    }
}
