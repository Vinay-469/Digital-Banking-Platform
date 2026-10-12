using System.Text;
using Bank.IdentityService.Api.Application;
using Bank.IdentityService.Api.Domain;

namespace Bank.IdentityService.Api.Api;

public static class IdentityEndpoints
{
    public static void MapIdentityEndpoints(this WebApplication app)
    {
        app.MapGet("/api/User/check-email", (string email, IdentityUseCases useCases) =>
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return Results.BadRequest();
            }

            return Results.Ok(new { exists = useCases.IsEmailTaken(email) });
        });

        app.MapGet("/api/User/GetUserById", (int id, IdentityUseCases useCases) =>
        {
            var user = useCases.GetUserById(id);
            return user is null ? Results.Ok("User not found") : Results.Ok(user);
        });

        app.MapGet("/api/User/Login", (string username, string password, IdentityUseCases useCases) =>
            Results.Ok(useCases.Login(username, password)));

        app.MapPost("/api/User/AddUsers", (BankUser user, IdentityUseCases useCases) =>
        {
            if (string.IsNullOrWhiteSpace(user.Email))
            {
                return Results.BadRequest(new { field = "email", message = "Email is required" });
            }

            if (useCases.IsEmailTaken(user.Email))
            {
                return Results.Conflict(new { field = "email", message = "Email already taken" });
            }

            useCases.AddUser(user);
            return Results.Ok("User added successfully");
        });

        app.MapPut("/api/User/UpdateUserStatus", (int userId, string status, IdentityUseCases useCases) =>
        {
            var user = useCases.GetUserById(userId);
            if (user is null)
            {
                return Results.NotFound("User not found");
            }

            user.Status = status;
            return Results.Ok("User status updated successfully");
        });

        app.MapDelete("/api/User/DeleteProduct", (int id, IdentityUseCases useCases) =>
        {
            var user = useCases.GetUserById(id);
            return user is null ? Results.Ok("User not found") : Results.Ok("User deleted successfully");
        });

        app.MapGet("/api/User/GetUserIdByEmail", (string phone, string email, IdentityUseCases useCases) =>
        {
            var id = useCases.GetUserIdByEmailAndPhone(phone, email);
            return id is null ? Results.Ok("UserId not found") : Results.Ok(id.Value);
        });

        app.MapPut("/api/User/registerToNetBanking", (int userId, bool status, IdentityUseCases useCases) =>
            useCases.RegisterNetBanking(userId, status)
                ? Results.Ok("Net banking registered successfully")
                : Results.NotFound("User not found"));

        app.MapPut("/api/User/UpdateUserProfile", (int id, UpdateUserProfileDto dto, IdentityUseCases useCases) =>
            useCases.UpdateUserProfile(id, dto)
                ? Results.Ok("Profile updated successfully")
                : Results.NotFound("User not found"));

        app.MapPut("/api/User/resetPassword", (int userId, string password, IdentityUseCases useCases) =>
            useCases.ResetPassword(userId, password)
                ? Results.Ok("Password reset successfully")
                : Results.NotFound("User not found"));

        app.MapPut("/api/Address/update/{id:int}", (int id, Address address, IdentityUseCases useCases) =>
            useCases.UpdateAddress(id, address)
                ? Results.Ok(new { message = "Address updated successfully" })
                : Results.NotFound(new { message = "Address not found" }));

        app.MapPut("/api/kyc/UploadKycDocuments", async (HttpRequest request, int kycId, IdentityUseCases useCases) =>
        {
            var fileNames = new List<string>();
            if (request.HasFormContentType)
            {
                var form = await request.ReadFormAsync();
                fileNames.AddRange(form.Files.Select(file => file.FileName));
            }

            return useCases.UploadKycDocuments(kycId, fileNames)
                ? Results.Ok("Documents uploaded successfully")
                : Results.NotFound("KYC record not found");
        });

        app.MapGet("/api/kyc/GetKycDocuments", (int kycId, string documentType, IdentityUseCases useCases) =>
        {
            var kyc = useCases.GetKyc(kycId);
            if (kyc is null)
            {
                return Results.NotFound("Documents not found");
            }

            var selected = documentType.Equals("pan", StringComparison.OrdinalIgnoreCase)
                ? kyc.PanFile
                : kyc.AdhaarFile;

            var content = Encoding.UTF8.GetBytes($"Demo {documentType} document for KYC {kycId}: {selected ?? "not uploaded"}");
            return Results.File(content, "text/plain", $"{documentType}-{kycId}.txt");
        });

        app.MapGet("/api/kyc/IsKycDone", (int kycId, IdentityUseCases useCases) =>
        {
            var kyc = useCases.GetKyc(kycId);
            return kyc is null
                ? Results.NotFound("KYC record not found")
                : Results.Ok(new { kycId, isKycCompleted = kyc.KycStatus });
        });
    }
}
