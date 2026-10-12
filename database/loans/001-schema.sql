CREATE TABLE Loans (
    LoanId BIGINT IDENTITY(100000000,1) PRIMARY KEY,
    UserId INT NOT NULL,
    AccountId INT,
    BranchId INT NOT NULL,
    LoanType VARCHAR(20),
    Amount DECIMAL(15,2),
    InterestRate DECIMAL(5,2),
    TenureMonths INT,
    AppliedDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    ApprovedDate DATETIME,
    ApplicationStatus VARCHAR(25),
    ClosingDate DATETIME,
    CollateralDetails VARCHAR(500),
    UserNameSnapshot VARCHAR(150),
    AccountNumberSnapshot BIGINT,
    BranchNameSnapshot VARCHAR(100)
);

CREATE INDEX IX_Loans_UserId ON Loans(UserId);
CREATE INDEX IX_Loans_BranchId ON Loans(BranchId);
