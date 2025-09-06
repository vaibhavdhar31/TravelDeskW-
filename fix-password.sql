USE TravelDeskDB;
GO

-- Drop and recreate Users table with correct password hash type
DROP TABLE IF EXISTS RequestComments;
DROP TABLE IF EXISTS TravelRequests;
DROP TABLE IF EXISTS Users;
GO

-- Recreate Users table with correct schema
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,  -- Changed to NVARCHAR for BCrypt hash
    RoleId INT NOT NULL,
    FirstName NVARCHAR(100) NULL,
    LastName NVARCHAR(100) NULL,
    EmployeeId NVARCHAR(50) NULL,
    Department NVARCHAR(100) NULL,
    ManagerId INT NULL,
    FOREIGN KEY (RoleId) REFERENCES Roles(RoleId),
    FOREIGN KEY (ManagerId) REFERENCES Users(UserId)
);
GO

-- Insert test users with BCrypt hashes
INSERT INTO Users (Email, PasswordHash, RoleId, FirstName, LastName, EmployeeId, Department) VALUES 
('employee1@cgi.com', '$2a$11$sHvgVn9JtXDUSB6fN162VuzA5Z1H1a0lpVIYGCPeQTUPYlJxCG5q6', 1, 'John', 'Doe', 'EMP001', 'IT'),
('manager1@cgi.com', '$2a$11$sHvgVn9JtXDUSB6fN162VuzA5Z1H1a0lpVIYGCPeQTUPYlJxCG5q6', 2, 'Jane', 'Smith', 'MGR001', 'IT'),
('admin1@cgi.com', '$2a$11$sHvgVn9JtXDUSB6fN162VuzA5Z1H1a0lpVIYGCPeQTUPYlJxCG5q6', 3, 'Admin', 'User', 'ADM001', 'HR');
GO

-- Recreate TravelRequests table
CREATE TABLE TravelRequests (
    RequestId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NOT NULL,
    EmployeeId NVARCHAR(50) NOT NULL,
    ProjectName NVARCHAR(100) NOT NULL,
    DepartmentName NVARCHAR(100) NOT NULL,
    ReasonForTravelling NVARCHAR(500) NOT NULL,
    TypeOfBooking NVARCHAR(50) NOT NULL,
    FlightType NVARCHAR(50),
    Dates NVARCHAR(100),
    AadhaarNumber NVARCHAR(20),
    PassportNumber NVARCHAR(20),
    VisaFileUrl NVARCHAR(500),
    PassportFileUrl NVARCHAR(500),
    DaysOfStay INT,
    MealRequired BIT,
    MealPreference NVARCHAR(100),
    Status NVARCHAR(50) NOT NULL DEFAULT 'Pending',
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
GO

-- Recreate RequestComments table
CREATE TABLE RequestComments (
    CommentId INT IDENTITY(1,1) PRIMARY KEY,
    RequestId INT NOT NULL,
    UserId INT NOT NULL,
    Comment NVARCHAR(1000) NOT NULL,
    CommentedAt DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (RequestId) REFERENCES TravelRequests(RequestId),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);
GO

PRINT 'Database schema fixed successfully!';
