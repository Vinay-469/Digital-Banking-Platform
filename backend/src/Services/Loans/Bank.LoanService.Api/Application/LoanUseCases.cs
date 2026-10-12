using Bank.LoanService.Api.Domain;
using Bank.LoanService.Api.Infrastructure;

namespace Bank.LoanService.Api.Application;

public sealed class LoanUseCases
{
    private readonly LoanStore store;

    public LoanUseCases(LoanStore store)
    {
        this.store = store;
    }

    public IReadOnlyList<Loan> GetByUserId(int userId)
    {
        return store.Loans.Where(loan => loan.UserId == userId).OrderByDescending(loan => loan.AppliedDate).ToList();
    }

    public IReadOnlyList<Loan> GetPending()
    {
        return store.Loans.Where(loan => loan.ApplicationStatus == "Pending").ToList();
    }

    public Loan Add(Loan loan)
    {
        return store.Add(loan);
    }

    public bool Process(long loanId, string status)
    {
        var loan = store.Loans.FirstOrDefault(candidate => candidate.LoanId == loanId);
        if (loan is null)
        {
            return false;
        }

        loan.ApplicationStatus = status;
        loan.ApprovedDate = DateTime.UtcNow;
        return true;
    }
}
