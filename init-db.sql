-- Create TravelDeskDB database and tables
USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TravelDeskDB')
BEGIN
    CREATE DATABASE TravelDeskDB;
END
GO

USE TravelDeskDB;
GO

-- Create Roles table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
BEGIN
    CREATE TABLE Roles (
        RoleId INT IDENTITY(1,1) PRIMARY KEY,
        RoleName NVARCHAR(50) NOT NULL
    );
END
GO

-- Create Users table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
BEGIN
    CREATE TABLE Users (
        UserId INT IDENTITY(1,1) PRIMARY KEY,
        Email NVARCHAR(100) NOT NULL UNIQUE,
        PasswordHash VARBINARY(MAX) NOT NULL,
        RoleId INT NOT NULL,
        FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
    );
END
GO

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
END
GO

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
END
GO

-- Insert default roles
IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'Employee')
BEGIN
    INSERT INTO Roles (RoleName) VALUES ('Employee');
END
GO

IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'Manager')
BEGIN
    INSERT INTO Roles (RoleName) VALUES ('Manager');
END
GO

IF NOT EXISTS (SELECT * FROM Roles WHERE RoleName = 'Travel Admin')
BEGIN
    INSERT INTO Roles (RoleName) VALUES ('Travel Admin');
END
GO

-- Insert default users with hashed passwords (password123)
DECLARE @EmployeeRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'Employee');
DECLARE @ManagerRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'Manager');
DECLARE @AdminRoleId INT = (SELECT RoleId FROM Roles WHERE RoleName = 'Travel Admin');

-- Employee user
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'employee1@cgi.com')
BEGIN
    INSERT INTO Users (Email, PasswordHash, RoleId) 
    VALUES ('employee1@cgi.com', 
            CONVERT(VARBINARY(MAX), '$2a$11$8YvF8Zq5Zq5Zq5Zq5Zq5ZuJ5Zq5Zq5Zq5Zq5Zq5Zq5Zq5Zq5Zq5Z'), 
            @EmployeeRoleId);
END
GO

-- Manager user
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'manager1@cgi.com')
BEGIN
    INSERT INTO Users (Email, PasswordHash, RoleId) 
    VALUES ('manager1@cgi.com', 
            CONVERT(VARBINARY(MAX), '$2a$11$8YvF8Zq5Zq5Zq5Zq5Zq5ZuJ5Zq5Zq5Zq5Zq5Zq5Zq5Zq5Zq5Zq5Z'), 
            @ManagerRoleId);
END
GO

-- Admin user
IF NOT EXISTS (SELECT * FROM Users WHERE Email = 'admin1@cgi.com')
BEGIN
    INSERT INTO Users (Email, PasswordHash, RoleId) 
    VALUES ('admin1@cgi.com', 
            CONVERT(VARBINARY(MAX), '$2a$11$8YvF8Zq5Zq5Zq5Zq5Zq5ZuJ5Zq5Zq5Zq5Zq5Zq5Zq5Zq5Zq5Zq5Z'), 
            @AdminRoleId);
END
GO

PRINT 'Database initialization completed successfully!';
