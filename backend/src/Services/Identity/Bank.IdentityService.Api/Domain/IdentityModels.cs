namespace Bank.IdentityService.Api.Domain;

public sealed class Address
{
    public int AddressId { get; set; }
    public string? DoorNumber { get; set; }
    public string? LandMark { get; set; }
    public string? Street { get; set; }
    public string? City { get; set; }
    public int? PinCode { get; set; }
    public string? District { get; set; }
    public string? State { get; set; }
    public string? Country { get; set; }
}

public sealed class KycDocument
{
    public int KycId { get; set; }
    public string? PanNumber { get; set; }
    public string? AdhaarNumber { get; set; }
    public string? ProfileImage { get; set; }
    public DateTime SubmittedOn { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedOn { get; set; }
    public string? AdhaarFile { get; set; }
    public string? PanFile { get; set; }
    public bool KycStatus { get; set; }
}

public sealed class BankUser
{
    public int UserId { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string? Phone { get; set; }
    public int? AddressId { get; set; }
    public Address? Address { get; set; }
    public int? KycId { get; set; }
    public KycDocument? Kyc { get; set; }
    public string? Role { get; set; } = "User";
    public string? Status { get; set; } = "Active";
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public DateTime? DateJoined { get; set; } = DateTime.UtcNow;
    public string? Occupation { get; set; }
    public string? MaritalStatus { get; set; }
    public string? Password { get; set; }
    public bool NetbankingStatus { get; set; }
}

public sealed class UpdateUserProfileDto
{
    public string? FullName { get; set; }
    public string? Phone { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Gender { get; set; }
    public string? Occupation { get; set; }
    public string? MaritalStatus { get; set; }
}

public sealed class OtpDto
{
    public int UserId { get; set; }
    public int Otp { get; set; }
}
