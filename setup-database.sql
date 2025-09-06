-- Use your existing TravelDeskDB database
USE TravelDeskDB;

-- Create Roles table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        RoleId INT IDENTITY(1,1) PRIMARY KEY,
        RoleName NVARCHAR(50) NOT NULL
    );
    
    INSERT INTO Roles (RoleName) VALUES 
    ('Admin'),
    ('HR Travel Admin'), 
    ('Employee'),
    ('Manager');
END;

-- Create Users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash VARBINARY(MAX) NOT NULL,
        RoleId INT NOT NULL,
        FirstName NVARCHAR(100),
        LastName NVARCHAR(100),
        EmployeeId NVARCHAR(50),
        Department NVARCHAR(100),
        ManagerId INT,
        FOREIGN KEY (RoleId) REFERENCES Roles(RoleId),
        FOREIGN KEY (ManagerId) REFERENCES Users(UserId)
    );
    
    -- Insert test users (password: password123)
    INSERT INTO Users (Email, PasswordHash, RoleId, FirstName, LastName, EmployeeId, Department) VALUES 
    ('employee1@cgi.com', CONVERT(VARBINARY(MAX), '$2a$11$sHvgVn9JtXDUSB6fN162VuzA5Z1H1a0lpVIYGCPeQTUPYlJxCG5q6'), 3, 'John', 'Employee', 'EMP001', 'IT'),
    ('manager1@cgi.com', CONVERT(VARBINARY(MAX), '$2a$11$sHvgVn9JtXDUSB6fN162VuzA5Z1H1a0lpVIYGCPeQTUPYlJxCG5q6'), 4, 'Jane', 'Manager', 'MGR001', 'IT'),
    ('admin1@cgi.com', CONVERT(VARBINARY(MAX), '$2a$11$sHvgVn9JtXDUSB6fN162VuzA5Z1H1a0lpVIYGCPeQTUPYlJxCG5q6'), 2, 'Admin', 'User', 'ADM001', 'HR');
END;

-- Create TravelRequests table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TravelRequests')
BEGIN
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
END;

-- Create RequestComments table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RequestComments')
BEGIN
    CREATE TABLE RequestComments (
        CommentId INT IDENTITY(1,1) PRIMARY KEY,
        RequestId INT NOT NULL,
        UserId INT NOT NULL,
        Comment NVARCHAR(1000) NOT NULL,
        CommentedAt DATETIME2 DEFAULT GETDATE(),
        FOREIGN KEY (RequestId) REFERENCES TravelRequests(RequestId),
        FOREIGN KEY (UserId) REFERENCES Users(UserId)
    );
END;

SELECT 'Database setup completed successfully!' AS Result;
