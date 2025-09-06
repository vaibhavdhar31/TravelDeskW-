USE TravelDeskDB;
GO

-- Add missing columns to Users table
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'FirstName')
BEGIN
    ALTER TABLE Users ADD FirstName NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'LastName')
BEGIN
    ALTER TABLE Users ADD LastName NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'EmployeeId')
BEGIN
    ALTER TABLE Users ADD EmployeeId NVARCHAR(50) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'Department')
BEGIN
    ALTER TABLE Users ADD Department NVARCHAR(100) NULL;
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('Users') AND name = 'ManagerId')
BEGIN
    ALTER TABLE Users ADD ManagerId INT NULL;
    ALTER TABLE Users ADD CONSTRAINT FK_Users_Manager FOREIGN KEY (ManagerId) REFERENCES Users(UserId);
END
GO

-- Update existing users with sample data
UPDATE Users SET 
    FirstName = 'John', 
    LastName = 'Doe', 
    EmployeeId = 'EMP001', 
    Department = 'IT'
WHERE Email = 'employee1@cgi.com';

UPDATE Users SET 
    FirstName = 'Jane', 
    LastName = 'Smith', 
    EmployeeId = 'MGR001', 
    Department = 'IT'
WHERE Email = 'manager1@cgi.com';

UPDATE Users SET 
    FirstName = 'Admin', 
    LastName = 'User', 
    EmployeeId = 'ADM001', 
    Department = 'HR'
WHERE Email = 'admin1@cgi.com';

PRINT 'Database schema updated successfully!';
