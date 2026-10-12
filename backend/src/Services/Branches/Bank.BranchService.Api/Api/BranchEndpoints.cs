using Bank.BranchService.Api.Application;
using Bank.BranchService.Api.Domain;

namespace Bank.BranchService.Api.Api;

public static class BranchEndpoints
{
    public static void MapBranchEndpoints(this WebApplication app)
    {
        app.MapGet("/api/Branches/GetAllBranches", (BranchUseCases useCases) =>
            Results.Ok(new GenericResponse { Status = true, Data = useCases.GetAllBranches() }));

        app.MapGet("/api/Branches/GetBranchId", (string location, string city, BranchUseCases useCases) =>
        {
            if (string.IsNullOrWhiteSpace(location) || string.IsNullOrWhiteSpace(city))
            {
                return Results.BadRequest("Location and City are required.");
            }

            var branchId = useCases.GetBranchId(location, city);
            return branchId is null ? Results.NotFound("Branch not found.") : Results.Ok(branchId);
        });
    }
}
