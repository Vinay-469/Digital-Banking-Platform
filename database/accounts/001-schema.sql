CREATE TABLE AccountTypes (
    AccountTypeId INT IDENTITY(4000,1) PRIMARY KEY,
    AccountTypeName VARCHAR(30) NOT NULL,
    InterestRate DECIMAL(5,2),
    OverdraftLimit INT,
    Threshold INT
);

CREATE TABLE Accounts (
    AccountId INT IDENTITY(1000,1) PRIMARY KEY,
    AccountNumber BIGINT,
    UserId INT NOT NULL,
    BranchId INT NOT NULL,
    Balance DECIMAL(15,2) DEFAULT 0.00,
    AccountStatus INT DEFAULT 1,
    AccountTypeId INT NOT NULL,
    CreatedOn DATETIME DEFAULT CURRENT_TIMESTAMP,
    CreatedBy VARCHAR(50),
    ModifiedOn DATETIME,
    ModifiedBy VARCHAR(50),
    CustomThreshold INT,
    IsLocked INT DEFAULT 0,
    ClosingDate DATETIME,
    PIN VARCHAR(10),
    UserFullNameSnapshot VARCHAR(150),
    BranchNameSnapshot VARCHAR(100),
    BranchIfscSnapshot VARCHAR(30),
    CONSTRAINT FK_Accounts_AccountTypes FOREIGN KEY (AccountTypeId) REFERENCES AccountTypes(AccountTypeId)
);

CREATE INDEX IX_Accounts_UserId ON Accounts(UserId);
CREATE INDEX IX_Accounts_BranchId ON Accounts(BranchId);
