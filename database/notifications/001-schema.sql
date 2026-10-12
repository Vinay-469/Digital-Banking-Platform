CREATE TABLE Notifications (
    NotificationId INT IDENTITY(5000,1) PRIMARY KEY,
    UserId INT NOT NULL,
    Type VARCHAR(50),
    Message VARCHAR(1000),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

CREATE TABLE Otps (
    OtpId INT IDENTITY(100,1) PRIMARY KEY,
    Otp INT NOT NULL,
    UserId INT NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    OtpCount INT,
    IsLockedAt DATETIME,
    IsUsed BIT DEFAULT 0
);

CREATE INDEX IX_Notifications_UserId ON Notifications(UserId);
CREATE INDEX IX_Otps_UserId ON Otps(UserId);
