using System.Text;
using Bank.IdentityService.Api.Domain;
using Bank.IdentityService.Api.Infrastructure;

namespace Bank.IdentityService.Api.Application;

public sealed class IdentityUseCases
{
    private readonly IdentityStore store;

    public IdentityUseCases(IdentityStore store)
    {
        this.store = store;
    }

    public bool IsEmailTaken(string email)
    {
        return store.Users.Any(user => string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase));
    }

    public BankUser? GetUserById(int id)
    {
        return store.Users.FirstOrDefault(user => user.UserId == id);
    }

    public object Login(string username, string password)
    {
        var user = store.Users.FirstOrDefault(candidate =>
            (string.Equals(candidate.Email, username, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(candidate.FullName, username, StringComparison.OrdinalIgnoreCase) ||
             string.Equals(candidate.Phone, username, StringComparison.OrdinalIgnoreCase)) &&
            !string.IsNullOrWhiteSpace(candidate.Password) &&
            !string.IsNullOrWhiteSpace(password) && candidate.Password == password);

        if (user is null)
        {
            return new { status = false, token = "", userDetails = (BankUser?)null };
        }

        var token = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{user.UserId}:{user.Email}:{DateTimeOffset.UtcNow:O}"));
        return new { status = true, token, userDetails = user };
    }

    public BankUser AddUser(BankUser user)
    {
        return store.AddUser(user);
    }

    public int? GetUserIdByEmailAndPhone(string phone, string email)
    {
        return store.Users
            .FirstOrDefault(user =>
                string.Equals(user.Phone, phone, StringComparison.OrdinalIgnoreCase) &&
                string.Equals(user.Email, email, StringComparison.OrdinalIgnoreCase))
            ?.UserId;
    }

    public bool RegisterNetBanking(int userId, bool status)
    {
        var user = GetUserById(userId);
        if (user is null)
        {
            return false;
        }

        user.NetbankingStatus = status;
        return true;
    }

    public bool UpdateUserProfile(int id, UpdateUserProfileDto dto)
    {
        var user = GetUserById(id);
        if (user is null)
        {
            return false;
        }

        user.FullName = dto.FullName ?? user.FullName;
        user.Phone = dto.Phone ?? user.Phone;
        user.DateOfBirth = dto.DateOfBirth ?? user.DateOfBirth;
        user.Gender = dto.Gender ?? user.Gender;
        user.Occupation = dto.Occupation ?? user.Occupation;
        user.MaritalStatus = dto.MaritalStatus ?? user.MaritalStatus;
        return true;
    }

    public bool ResetPassword(int userId, string password)
    {
        var user = GetUserById(userId);
        if (user is null)
        {
            return false;
        }

        user.Password = password;
        return true;
    }

    public bool UpdateAddress(int id, Address address)
    {
        var existing = store.Addresses.FirstOrDefault(candidate => candidate.AddressId == id);
        if (existing is null)
        {
            return false;
        }

        existing.DoorNumber = address.DoorNumber ?? existing.DoorNumber;
        existing.LandMark = address.LandMark ?? existing.LandMark;
        existing.Street = address.Street ?? existing.Street;
        existing.City = address.City ?? existing.City;
        existing.PinCode = address.PinCode ?? existing.PinCode;
        existing.District = address.District ?? existing.District;
        existing.State = address.State ?? existing.State;
        existing.Country = address.Country ?? existing.Country;
        return true;
    }

    public bool UploadKycDocuments(int kycId, IReadOnlyList<string> fileNames)
    {
        var kyc = store.KycDocuments.FirstOrDefault(candidate => candidate.KycId == kycId);
        if (kyc is null)
        {
            return false;
        }

        if (fileNames.Count > 0)
        {
            kyc.AdhaarFile = fileNames[0];
        }

        if (fileNames.Count > 1)
        {
            kyc.PanFile = fileNames[1];
        }

        kyc.KycStatus = true;
        kyc.ApprovedOn ??= DateTime.UtcNow;
        return true;
    }

    public KycDocument? GetKyc(int kycId)
    {
        return store.KycDocuments.FirstOrDefault(candidate => candidate.KycId == kycId);
    }
}
