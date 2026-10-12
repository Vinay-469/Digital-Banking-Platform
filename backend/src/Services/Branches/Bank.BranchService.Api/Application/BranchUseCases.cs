using Bank.BranchService.Api.Domain;
using Bank.BranchService.Api.Infrastructure;

namespace Bank.BranchService.Api.Application;

public sealed class BranchUseCases
{
    private readonly BranchStore store;

    public BranchUseCases(BranchStore store)
    {
        this.store = store;
    }

    public IReadOnlyList<Branch> GetAllBranches()
    {
        return store.Branches.Where(branch => branch.IsActive).ToList();
    }

    public object? GetBranchId(string location, string city)
    {
        var branch = store.Branches.FirstOrDefault(candidate =>
            string.Equals(candidate.BranchLocation, location, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(candidate.City, city, StringComparison.OrdinalIgnoreCase) &&
            candidate.IsActive);

        return branch is null ? null : new { branch.BranchId };
    }
}
