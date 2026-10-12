CREATE TABLE Address (
    AddressId INT IDENTITY(300,1) PRIMARY KEY,
    DoorNumber VARCHAR(10),
    LandMark VARCHAR(100),
    Street VARCHAR(50),
    City VARCHAR(50),
    PinCode INT,
    District VARCHAR(50),
    State VARCHAR(30),
    Country VARCHAR(50)
);

CREATE TABLE KycDocuments (
    KycId INT IDENTITY(3000,1) PRIMARY KEY,
    PanNumber VARCHAR(20) NOT NULL,
    AdhaarNumber VARCHAR(20) NOT NULL,
    ProfileImage VARCHAR(500),
    SubmittedOn DATETIME NOT NULL,
    ApprovedOn DATETIME,
    AdhaarFile VARCHAR(500),
    PanFile VARCHAR(500),
    KycStatus BIT DEFAULT 0
);

CREATE TABLE Users (
    UserId INT IDENTITY(2000000,1) PRIMARY KEY,
    FullName VARCHAR(150) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    Phone VARCHAR(20),
    AddressId INT NULL,
    KycId INT NULL,
    Role VARCHAR(30),
    Status VARCHAR(20),
    DateOfBirth DATE,
    Gender VARCHAR(10),
    DateJoined DATE,
    Occupation VARCHAR(100),
    MaritalStatus VARCHAR(20),
    Password VARCHAR(250),
    NetbankingStatus BIT DEFAULT 0,
    CONSTRAINT FK_Users_Address FOREIGN KEY (AddressId) REFERENCES Address(AddressId),
    CONSTRAINT FK_Users_KycDocuments FOREIGN KEY (KycId) REFERENCES KycDocuments(KycId)
);
