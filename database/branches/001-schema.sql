CREATE TABLE Branches (
    BranchId INT IDENTITY(1000,1) PRIMARY KEY,
    BranchName VARCHAR(100) NOT NULL,
    BranchCode VARCHAR(20) NOT NULL UNIQUE,
    BranchLocation VARCHAR(255),
    City VARCHAR(100),
    State VARCHAR(100),
    Pincode VARCHAR(20),
    Country VARCHAR(50),
    ContactNumber VARCHAR(20),
    Email VARCHAR(150),
    IfscCode VARCHAR(30),
    OpeningDate DATETIME,
    NumEmployees INT,
    IsActive BIT DEFAULT 1
);
