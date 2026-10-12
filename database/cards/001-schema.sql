CREATE TABLE CardTypes (
    CardTypeId INT IDENTITY(1,1) PRIMARY KEY,
    CardTypeName VARCHAR(20) NOT NULL,
    Network VARCHAR(20) NOT NULL,
    DefaultLimit DECIMAL(15,2),
    MaxLimit DECIMAL(15,2)
);

CREATE TABLE Cards (
    CardId INT IDENTITY(5000,1) PRIMARY KEY,
    UserId INT NOT NULL,
    AccountId INT NOT NULL,
    CardTypeId INT NOT NULL,
    CardNumber BIGINT,
    IssueDate DATETIME NOT NULL,
    ExpiryDate DATETIME NOT NULL,
    Cvv INT,
    Status INT DEFAULT 1,
    WithdrawLimit DECIMAL(15,2),
    AvailableCredit DECIMAL(15,2),
    Pin INT,
    AccountNumberSnapshot BIGINT,
    AccountTypeSnapshot VARCHAR(30),
    UserNameSnapshot VARCHAR(150),
    CONSTRAINT FK_Cards_CardTypes FOREIGN KEY (CardTypeId) REFERENCES CardTypes(CardTypeId)
);

CREATE TABLE DebitCardApplications (
    ApplicationId INT IDENTITY(6000,1) PRIMARY KEY,
    AccountId INT NOT NULL,
    UserId INT NOT NULL,
    CommunicationAddress VARCHAR(500),
    AppliedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ApprovedDate DATETIME,
    ApplicationStatus VARCHAR(25),
    CardType VARCHAR(25),
    AccountNumberSnapshot BIGINT,
    UserNameSnapshot VARCHAR(150),
    UserEmailSnapshot VARCHAR(150),
    UserPhoneSnapshot VARCHAR(20)
);

CREATE TABLE CreditCardApplications (
    ApplicationId INT IDENTITY(7000,1) PRIMARY KEY,
    UserId INT NOT NULL,
    AnnualIncome DECIMAL(15,2),
    EmploymentStatus INT,
    AppliedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ApprovedDate DATETIME,
    ApplicationStatus VARCHAR(25),
    CardType VARCHAR(25),
    CardPlan VARCHAR(25),
    PayslipsPath VARCHAR(500)
);
