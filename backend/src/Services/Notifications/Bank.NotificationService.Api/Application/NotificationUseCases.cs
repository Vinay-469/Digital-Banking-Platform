using Bank.NotificationService.Api.Domain;
using Bank.NotificationService.Api.Infrastructure;

namespace Bank.NotificationService.Api.Application;

public sealed class NotificationUseCases
{
    private readonly NotificationStore store;

    public NotificationUseCases(NotificationStore store)
    {
        this.store = store;
    }

    public bool AddNotification(Notification notification)
    {
        store.AddNotification(notification);
        return true;
    }

    public IReadOnlyList<Notification> GetNotificationsByUserId(int userId)
    {
        return store.Notifications
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .ToList();
    }

    public bool MarkAsRead(int notificationId)
    {
        var notification = store.Notifications.FirstOrDefault(candidate => candidate.NotificationId == notificationId);
        if (notification is null)
        {
            return false;
        }

        notification.IsRead = true;
        return true;
    }

    public object GenerateOtp(string phone, string email)
    {
        var userId = ResolveUserId(phone, email);
        var otp = store.AddOtp(userId, Random.Shared.Next(100000, 999999));
        return new { Message = "OTP sent successfully", id = otp.UserId, otp = otp.Value };
    }

    public string VerifyOtp(OtpDto request)
    {
        var otp = store.Otps
            .Where(candidate => candidate.UserId == request.UserId)
            .OrderByDescending(candidate => candidate.CreatedAt)
            .FirstOrDefault();

        if (otp is null)
        {
            return "User not found";
        }

        if (otp.IsUsed)
        {
            return "OTP already used";
        }

        if (otp.CreatedAt.AddMinutes(10) < DateTime.UtcNow)
        {
            return "OTP expired";
        }

        if (otp.Value != request.Otp)
        {
            return "Invalid OTP";
        }

        otp.IsUsed = true;
        return "OTP Verified Successfully";
    }

    private static int ResolveUserId(string phone, string email)
    {
        if (email.Equals("customer@example.invalid", StringComparison.OrdinalIgnoreCase) || phone == "0000000001")
        {
            return 2000000;
        }

        if (email.Equals("manager@example.invalid", StringComparison.OrdinalIgnoreCase) || phone == "0000000002")
        {
            return 2000001;
        }

        return 2000002;
    }
}
