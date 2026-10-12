using Bank.NotificationService.Api.Domain;

namespace Bank.NotificationService.Api.Infrastructure;

public sealed class NotificationStore
{
    private readonly object syncRoot = new();
    private int nextNotificationId = 5002;
    private int nextOtpId = 102;

    public NotificationStore()
    {
        Notifications.AddRange(new[]
        {
            new Notification { NotificationId = 5000, UserId = 2000000, Type = "info", Message = "Welcome to net banking.", IsRead = false, CreatedAt = DateTime.UtcNow.AddDays(-5) },
            new Notification { NotificationId = 5001, UserId = 2000000, Type = "transaction", Message = "Your salary account was credited.", IsRead = false, CreatedAt = DateTime.UtcNow.AddDays(-1) }
        });

        Otps.Add(new Otp { OtpId = 100, UserId = 2000000, Value = 123456, CreatedAt = DateTime.UtcNow, OtpCount = 1, IsUsed = false });
    }

    public List<Notification> Notifications { get; } = new();
    public List<Otp> Otps { get; } = new();

    public Notification AddNotification(Notification notification)
    {
        lock (syncRoot)
        {
            notification.NotificationId = nextNotificationId++;
            notification.CreatedAt = notification.CreatedAt == default ? DateTime.UtcNow : notification.CreatedAt;
            Notifications.Add(notification);
            return notification;
        }
    }

    public Otp AddOtp(int userId, int value)
    {
        lock (syncRoot)
        {
            var otp = new Otp
            {
                OtpId = nextOtpId++,
                UserId = userId,
                Value = value,
                CreatedAt = DateTime.UtcNow,
                OtpCount = 1
            };

            Otps.Add(otp);
            return otp;
        }
    }
}
