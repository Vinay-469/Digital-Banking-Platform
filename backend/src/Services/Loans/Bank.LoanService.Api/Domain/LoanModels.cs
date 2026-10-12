namespace Bank.LoanService.Api.Domain;

public sealed class Loan
{
    public long LoanId { get; set; }
    public int UserId { get; set; }
    public int? AccountId { get; set; }
    public int BranchId { get; set; }
    public string? LoanType { get; set; }
    public decimal Amount { get; set; }
    public decimal InterestRate { get; set; }
    public int TenureMonths { get; set; }
    public DateTime AppliedDate { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedDate { get; set; }
    public string ApplicationStatus { get; set; } = "Pending";
    public DateTime? ClosingDate { get; set; }
    public string? CollateralDetails { get; set; }
}
