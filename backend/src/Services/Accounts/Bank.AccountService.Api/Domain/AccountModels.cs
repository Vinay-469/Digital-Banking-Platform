namespace Bank.AccountService.Api.Domain;

public sealed class GenericResponse
{
    public bool Status { get; set; }
    public object? Data { get; set; }
    public string? Message { get; set; }
}

public sealed class AccountType
{
    public int AccountTypeId { get; set; }
    public string AccountTypeName { get; set; } = "";
    public decimal InterestRate { get; set; }
    public int OverdraftLimit { get; set; }
    public int Threshold { get; set; }
}

public sealed class Account
{
    public int AccountId { get; set; }
    public long AccountNumber { get; set; }
    public int UserId { get; set; }
    public UserSnapshot User { get; set; } = new();
    public int BranchId { get; set; }
    public BranchSnapshot Branch { get; set; } = new();
    public decimal Balance { get; set; }
    public int AccountStatus { get; set; } = 1;
    public int AccountTypeId { get; set; }
    public AccountType AccountType { get; set; } = new();
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public string CreatedBy { get; set; } = "system";
    public DateTime? ModifiedOn { get; set; }
    public string? ModifiedBy { get; set; }
    public int? CustomThreshold { get; set; }
    public int IsLocked { get; set; }
    public DateTime? ClosingDate { get; set; }
    public string Pin { get; set; } = "0000";
}

public sealed class UserSnapshot
{
    public int UserId { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Occupation { get; set; }
    public DateTime? DateJoined { get; set; }
    public AddressSnapshot Address { get; set; } = new();
    public KycSnapshot Kyc { get; set; } = new();
}

public sealed class AddressSnapshot
{
    public string? DoorNumber { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
}

public sealed class KycSnapshot
{
    public string? PanNumber { get; set; }
    public string? AdhaarNumber { get; set; }
}

public sealed class BranchSnapshot
{
    public int BranchId { get; set; }
    public string BranchName { get; set; } = "";
    public string IfscCode { get; set; } = "";
    public string City { get; set; } = "";
}

public sealed class AccountDetailsDto
{
    public int AccountId { get; set; }
    public long AccountNumber { get; set; }
    public decimal Balance { get; set; }
    public int AccountStatus { get; set; }
    public int IsLocked { get; set; }
    public DateTime CreatedOn { get; set; }
    public string CreatedBy { get; set; } = "";
    public DateTime? ClosingDate { get; set; }
    public int Threshold { get; set; }
    public int UserId { get; set; }
    public string FullName { get; set; } = "";
    public int BranchId { get; set; }
    public string BranchName { get; set; } = "";
    public string IfscCode { get; set; } = "";
    public string City { get; set; } = "";
    public string AccountTypeName { get; set; } = "";
    public decimal InterestRate { get; set; }
    public int? CustomThreshold { get; set; }
}
