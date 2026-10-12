namespace Bank.NotificationService.Api.Domain;

public sealed class Notification
{
    public int NotificationId { get; set; }
    public int UserId { get; set; }
    public string? Type { get; set; }
    public string? Message { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class Otp
{
    public int OtpId { get; set; }
    public int Value { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int OtpCount { get; set; }
    public DateTime? IsLockedAt { get; set; }
    public bool IsUsed { get; set; }
}

public sealed class OtpDto
{
    public int UserId { get; set; }
    public int Otp { get; set; }
}
