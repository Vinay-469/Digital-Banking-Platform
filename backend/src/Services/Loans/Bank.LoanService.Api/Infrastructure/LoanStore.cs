using Bank.LoanService.Api.Domain;

namespace Bank.LoanService.Api.Infrastructure;

public sealed class LoanStore
{
    private readonly object syncRoot = new();
    private long nextLoanId = 100000001;

    public LoanStore()
    {
        Loans.Add(new Loan
        {
            LoanId = 100000000,
            UserId = 2000000,
            AccountId = 1000,
            BranchId = 1000,
            LoanType = "Personal",
            Amount = 250000,
            InterestRate = 11.5m,
            TenureMonths = 36,
            AppliedDate = DateTime.UtcNow.AddDays(-12),
            ApplicationStatus = "Pending",
            CollateralDetails = "Salary account relationship"
        });
    }

    public List<Loan> Loans { get; } = new();

    public Loan Add(Loan loan)
    {
        lock (syncRoot)
        {
            loan.LoanId = nextLoanId++;
            loan.AppliedDate = loan.AppliedDate == default ? DateTime.UtcNow : loan.AppliedDate;
            loan.ApplicationStatus = string.IsNullOrWhiteSpace(loan.ApplicationStatus) ? "Pending" : loan.ApplicationStatus;
            Loans.Add(loan);
            return loan;
        }
    }
}
