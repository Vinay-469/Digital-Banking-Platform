using Bank.NotificationService.Api.Application;
using Bank.NotificationService.Api.Domain;

namespace Bank.NotificationService.Api.Api;

public static class NotificationEndpoints
{
    public static void MapNotificationEndpoints(this WebApplication app)
    {
        app.MapPost("/api/Notifications/addNotification", (Notification notification, NotificationUseCases useCases) =>
            useCases.AddNotification(notification) ? Results.Ok("Notification added") : Results.StatusCode(500));

        app.MapGet("/api/Notifications/GetNotificationsByUserId/{userId:int}", (int userId, NotificationUseCases useCases) =>
        {
            var notifications = useCases.GetNotificationsByUserId(userId);
            return notifications.Count > 0 ? Results.Ok(notifications) : Results.Ok("No notifications");
        });

        app.MapPut("/api/Notifications/read/{notificationId:int}", (int notificationId, NotificationUseCases useCases) =>
            useCases.MarkAsRead(notificationId) ? Results.Ok("Updated") : Results.NotFound("Not found"));

        app.MapPost("/api/otp/send", (string phone, string email, NotificationUseCases useCases) =>
            Results.Ok(useCases.GenerateOtp(phone, email)));

        app.MapPost("/api/otp/verify", (OtpDto request, NotificationUseCases useCases) =>
        {
            var result = useCases.VerifyOtp(request);
            return result == "OTP Verified Successfully" ? Results.Ok(result) : Results.BadRequest(result);
        });
    }
}
