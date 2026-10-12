CREATE TABLE Transactions (
    TransactionId BIGINT IDENTITY(1000000,1) PRIMARY KEY,
    UserId INT NOT NULL,
    AccountId INT NOT NULL,
    Amount DECIMAL(15,2),
    TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Status VARCHAR(20),
    ReferenceAccountId INT,
    TransactionType BIT,
    AccountNumberSnapshot BIGINT,
    AccountTypeSnapshot VARCHAR(30),
    AccountUserNameSnapshot VARCHAR(150),
    ReferenceAccountNumberSnapshot BIGINT,
    ReferenceUserNameSnapshot VARCHAR(150)
);

CREATE INDEX IX_Transactions_UserId ON Transactions(UserId);
CREATE INDEX IX_Transactions_AccountId ON Transactions(AccountId);
