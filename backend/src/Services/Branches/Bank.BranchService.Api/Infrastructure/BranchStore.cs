using Bank.BranchService.Api.Domain;

namespace Bank.BranchService.Api.Infrastructure;

public sealed class BranchStore
{
    public BranchStore()
    {
        Branches.AddRange(new[]
        {
            new Branch { BranchId = 1000, BranchName = "Bengaluru Central", BranchCode = "BLR-CEN", BranchLocation = "MG Road", City = "Bengaluru", State = "Karnataka", Pincode = "560001", Country = "India", ContactNumber = "00000000001", Email = "branch1@example.invalid", IfscCode = "BANK0001000", OpeningDate = new DateTime(2018, 4, 1), NumEmployees = 42, IsActive = true },
            new Branch { BranchId = 1001, BranchName = "Chennai Main", BranchCode = "MAA-MAIN", BranchLocation = "Anna Salai", City = "Chennai", State = "Tamil Nadu", Pincode = "600002", Country = "India", ContactNumber = "00000000002", Email = "branch2@example.invalid", IfscCode = "BANK0001001", OpeningDate = new DateTime(2017, 6, 12), NumEmployees = 38, IsActive = true },
            new Branch { BranchId = 1002, BranchName = "Hyderabad Tech Park", BranchCode = "HYD-TP", BranchLocation = "Hitech City", City = "Hyderabad", State = "Telangana", Pincode = "500081", Country = "India", ContactNumber = "00000000003", Email = "branch3@example.invalid", IfscCode = "BANK0001002", OpeningDate = new DateTime(2020, 1, 20), NumEmployees = 30, IsActive = true }
        });
    }

    public List<Branch> Branches { get; } = new();
}
