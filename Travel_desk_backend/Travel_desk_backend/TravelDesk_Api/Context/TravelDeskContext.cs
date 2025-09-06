using System.Text;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using TravelDesk_Api.Models;

public class TravelDeskContext : DbContext
{
    public TravelDeskContext(DbContextOptions<TravelDeskContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<TravelRequest> TravelRequests { get; set; }
    public DbSet<RequestComment> RequestComments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Enforce unique constraint on Email
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        // Define the one-to-many relationship between Role and User
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId);

        // Self-referencing relationship for Manager. Add NoAction to prevent cycles.
        modelBuilder.Entity<User>()
            .HasOne(u => u.Manager)
            .WithMany(m => m.Subordinates)
            .HasForeignKey(u => u.ManagerId)
            .OnDelete(DeleteBehavior.NoAction);

        // Define relationship between TravelRequest and User. Add NoAction to prevent multiple paths.
        modelBuilder.Entity<TravelRequest>()
            .HasOne(tr => tr.User)
            .WithMany()
            .HasForeignKey(tr => tr.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        // Define relationship between RequestComment and TravelRequest.
        modelBuilder.Entity<RequestComment>()
            .HasOne(rc => rc.TravelRequest)
            .WithMany(tr => tr.Comments)
            .HasForeignKey(rc => rc.RequestId);

        // Define relationship between RequestComment and User. Add NoAction to prevent multiple paths.
        modelBuilder.Entity<RequestComment>()
            .HasOne(rc => rc.User)
            .WithMany()
            .HasForeignKey(rc => rc.UserId)
            .OnDelete(DeleteBehavior.NoAction);

        // Seed data for roles
        modelBuilder.Entity<Role>().HasData(
            new Role { RoleId = 1, RoleName = "Admin" },
            new Role { RoleId = 2, RoleName = "HR Travel Admin" },
            new Role { RoleId = 3, RoleName = "Employee" },
            new Role { RoleId = 4, RoleName = "Manager" }
        );

        // Seeding users with unique, hardcoded password hashes for each role.
        // You MUST replace these with hashes you generated yourself.
        var adminPasswordHash = "$2a$11$BUoL58RIX6iaCyJP9epMAuRdhABqmq6Zulb/ZGNMdsE4Qm.C6J6EK";
        var hrPasswordHash = "$2a$11$EX6rqH9avLIzbfz1m4xsR.pYK1Xbye7TXoUfH0TCPSfbK8xXV9cWa";
        var employeePasswordHash = "$2a$11$Qetyh.IOVeNUgMN3PASHDO0V2Q9ZExFRLa3loe2lBBXwqBCi57A42";
        var managerPasswordHash = "$2a$11$yBNCXt3Jl1EvbHnJ8rhN1.uG1CqAVE0u/xyuINORGfff2mJ8lgwzy";

        modelBuilder.Entity<User>().HasData(
            new User
            {
                UserId = 1,
                Email = "admin@traveldesk.com",
                PasswordHash = Encoding.UTF8.GetBytes("$2a$11$DnYVv8TPm1CDESiiDQtzbup6mhRJ6/ajPYEzVXkJCZ.tqv46iH8RS"),
                RoleId = 1,
                FirstName = "System",
                LastName = "Admin",
                EmployeeId = "A001",
                Department = "IT"
            },
            new User
            {
                UserId = 2,
                Email = "hr@traveldesk.com",
                PasswordHash = Encoding.UTF8.GetBytes("$2a$11$DnYVv8TPm1CDESiiDQtzbup6mhRJ6/ajPYEzVXkJCZ.tqv46iH8RS"),
                RoleId = 2,
                FirstName = "Hr",
                LastName = "Travel",
                EmployeeId = "T001",
                Department = "HR"
            },
            new User
            {
                UserId = 3,
                Email = "employee@traveldesk.com",
                PasswordHash = Encoding.UTF8.GetBytes(employeePasswordHash),
                RoleId = 3,
                FirstName = "Regular",
                LastName = "Employee",
                EmployeeId = "E001",
                Department = "Sales",
                ManagerId = 4
            },
            new User
            {
                UserId = 4,
                Email = "manager@traveldesk.com",
                PasswordHash = Encoding.UTF8.GetBytes("$2a$11$DnYVv8TPm1CDESiiDQtzbup6mhRJ6/ajPYEzVXkJCZ.tqv46iH8RS"),
                RoleId = 4,
                FirstName = "Project",
                LastName = "Manager",
                EmployeeId = "M001",
                Department = "Engineering"
            },
            new User
            {
                UserId = 5,
                Email = "janedoe@traveldesk.com",
                PasswordHash = Encoding.UTF8.GetBytes(employeePasswordHash),
                RoleId = 3,
                FirstName = "Jane",
                LastName = "Doe",
                EmployeeId = "E123",
                Department = "Marketing",
                ManagerId = 4
            }
        );
    }
}
