using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using TravelDesk_Api.Models;
using System.Security.Claims;
using System.Text;
using BCrypt.Net;

namespace TravelDesk_Api.Controllers
{
    // Corrected DTO to accept plain-text password
    public class AddUserDto
    {
        public string Email { get; set; }
        public string Password { get; set; } // Renamed from PasswordHash
        public int RoleId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        // public string? EmployeeId { get; set; }
        public string? Department { get; set; }
        public int? ManagerId { get; set; }
    }

    // New DTO for updating user information
    public class EditUserDto
    {
        public string? Email { get; set; }
        public string? Password { get; set; }
        public int? RoleId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? EmployeeId { get; set; }
        public string? Department { get; set; }
        public int? ManagerId { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly TravelDeskContext _context;

        public AdminController(TravelDeskContext context)
        {
            _context = context;
        }

        // View a user grid with all required details and the total user count
        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users.Include(u => u.Role)
                                             .Include(u => u.Manager)
                                             .Select(u => new
                                             {
                                                 u.UserId,
                                                 u.FirstName,
                                                 u.LastName,
                                                 u.EmployeeId,
                                                 u.Department,
                                                 Role = u.Role.RoleName,
                                                 u.RoleId,
                                                 ManagerName = u.Manager != null ? u.Manager.FirstName + " " + u.Manager.LastName : "N/A"
                                             })
                                             .ToListAsync();
            var totalUsers = await _context.Users.CountAsync();
            return Ok(new { TotalUsers = totalUsers, Users = users });
        }

        // Generate next employee ID based on role
private async Task<string> GenerateEmployeeId(int roleId)
{
    var role = await _context.Roles.FindAsync(roleId);
    string prefix = role?.RoleName switch
    {
        "Employee" => "EMP",
        "Manager" => "MGR", 
        "Admin" => "ADM",
        "HR Travel Admin" => "ADM",
        _ => "EMP"
    };

    var existingIds = await _context.Users
        .Where(u => u.EmployeeId.StartsWith(prefix))
        .Select(u => u.EmployeeId)
        .ToListAsync();

    int maxNumber = 0;
    foreach (var id in existingIds)
    {
        if (id.Length > 3 && int.TryParse(id.Substring(3), out int number))
        {
            maxNumber = Math.Max(maxNumber, number);
        }
    }

    return $"{prefix}{(maxNumber + 1):D3}";
}

        // Get all managers for dropdown
        [HttpGet("managers")]
        public async Task<IActionResult> GetManagers()
        {
            var managers = await _context.Users
                                         .Include(u => u.Role)
                                         .Where(u => u.Role.RoleName == "Manager")
                                         .Select(u => new
                                         {
                                             u.UserId,
                                             Name = u.FirstName + " " + u.LastName,
                                             u.Email,
                                             u.EmployeeId
                                         })
                                         .ToListAsync();
            return Ok(managers);
        }

        // Get all roles for dropdown
        [HttpGet("roles")]
        public async Task<IActionResult> GetRoles()
        {
            var roles = await _context.Roles
                                      .Select(r => new
                                      {
                                          r.RoleId,
                                          r.RoleName
                                      })
                                      .ToListAsync();
            return Ok(roles);
        }
        // Add a new user
        [HttpPost("add-user")]
        public async Task<IActionResult> AddUser([FromBody] AddUserDto userDto)
        {
            // Debug logging
            Console.WriteLine($"Received managerId: {userDto.ManagerId}");
            
            // Manual validation for required fields
            if (string.IsNullOrEmpty(userDto.Email) || string.IsNullOrEmpty(userDto.Password))
            {
                return BadRequest("Email and Password are required.");
            }

            // Check if email already exists
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == userDto.Email);
            if (existingUser != null)
            {
                return BadRequest("A user with this email already exists.");
            }

            var user = new User
            {
                Email = userDto.Email,
                // Correctly hash the plain-text password
                PasswordHash = Encoding.UTF8.GetBytes(BCrypt.Net.BCrypt.HashPassword(userDto.Password)),
                RoleId = userDto.RoleId,
                FirstName = userDto.FirstName,
                LastName = userDto.LastName,
                EmployeeId = await GenerateEmployeeId(userDto.RoleId),
                Department = userDto.Department,
                ManagerId = userDto.ManagerId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { 
                UserId = user.UserId,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                EmployeeId = user.EmployeeId,
                Department = user.Department,
                RoleId = user.RoleId
            });
        }

        // Edit/update user information
        [HttpPut("edit-user/{id}")]
        public async Task<IActionResult> EditUser(int id, [FromBody] EditUserDto updatedUserDto)
        {
            var userToUpdate = await _context.Users.FindAsync(id);
            if (userToUpdate == null)
            {
                return NotFound();

            // Check if user has travel requests
            var hasRequests = await _context.TravelRequests.AnyAsync(tr => tr.UserId == id);
            if (hasRequests)
            {
                return BadRequest("Cannot delete user. User has associated travel requests.");
            }

            // Check if user is a manager for other users
            var hasSubordinates = await _context.Users.AnyAsync(u => u.ManagerId == id);
            if (hasSubordinates)
            {
                return BadRequest("Cannot delete user. User is assigned as a manager to other employees.");
            }
            }

            // Update properties only if a new value is provided
            userToUpdate.Email = updatedUserDto.Email ?? userToUpdate.Email;
            userToUpdate.FirstName = updatedUserDto.FirstName ?? userToUpdate.FirstName;
            userToUpdate.LastName = updatedUserDto.LastName ?? userToUpdate.LastName;
            userToUpdate.EmployeeId = updatedUserDto.EmployeeId ?? userToUpdate.EmployeeId;
            userToUpdate.Department = updatedUserDto.Department ?? userToUpdate.Department;

            // Update ID-based fields only if a value is provided
            if (updatedUserDto.RoleId.HasValue) userToUpdate.RoleId = updatedUserDto.RoleId.Value;
            if (updatedUserDto.ManagerId.HasValue) userToUpdate.ManagerId = updatedUserDto.ManagerId.Value;
            if (!string.IsNullOrEmpty(updatedUserDto.Password))
            {
                userToUpdate.PasswordHash = Encoding.UTF8.GetBytes(BCrypt.Net.BCrypt.HashPassword(updatedUserDto.Password));
            }

            await _context.SaveChangesAsync();
            return Ok(userToUpdate);
        }

        // Delete a user
        [HttpDelete("delete-user/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var userToDelete = await _context.Users.FindAsync(id);
            if (userToDelete == null)
            {
                return NotFound();
            }

            // Check if user has travel requests
            var hasRequests = await _context.TravelRequests.AnyAsync(tr => tr.UserId == id);
            if (hasRequests)
            {
                return BadRequest("Cannot delete user. User has associated travel requests.");
            }

            // Check if user is a manager for other users
            var hasSubordinates = await _context.Users.AnyAsync(u => u.ManagerId == id);
            if (hasSubordinates)
            {
                return BadRequest("Cannot delete user. User is assigned as a manager to other employees.");
            }

            _context.Users.Remove(userToDelete);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // Soft delete a user (deactivate instead of delete)
        [HttpPut("deactivate-user/{id}")]
        public async Task<IActionResult> DeactivateUser(int id)
        {
            var userToDeactivate = await _context.Users.FindAsync(id);
            if (userToDeactivate == null)
            {
                return NotFound();
            }

            // Add IsActive field to User model if not exists, or use a status field
            // For now, we'll change their role or add a flag
            userToDeactivate.Department = "DEACTIVATED - " + userToDeactivate.Department;
            
            await _context.SaveChangesAsync();
            return Ok("User deactivated successfully");
        }

        // Check user relationships
        [HttpGet("check-relationships")]
        public async Task<IActionResult> CheckRelationships()
        {
            var users = await _context.Users
                .Select(u => new {
                    UserId = u.UserId,
                    Name = u.FirstName + " " + u.LastName,
                    Email = u.Email,
                    ManagerId = u.ManagerId,
                    ManagerName = u.ManagerId != null ? 
                        _context.Users.Where(m => m.UserId == u.ManagerId)
                                     .Select(m => m.FirstName + " " + m.LastName)
                                     .FirstOrDefault() : null
                })
                .ToListAsync();
            
            return Ok(users);
        }

        // Test specific relationship
        [HttpGet("test-relationship")]
        public async Task<IActionResult> TestRelationship()
        {
            var gaurav = await _context.Users.FirstOrDefaultAsync(u => u.Email == "dhardubey45@gmail.com");
            var vaibhav = await _context.Users.FirstOrDefaultAsync(u => u.Email == "dhardubey11@gmail.com");
            
            return Ok(new {
                Gaurav = gaurav != null ? new { gaurav.UserId, gaurav.FirstName, gaurav.LastName, gaurav.ManagerId } : null,
                Vaibhav = vaibhav != null ? new { vaibhav.UserId, vaibhav.FirstName, vaibhav.LastName } : null,
                IsLinked = gaurav?.ManagerId == vaibhav?.UserId
            });
        }
    }
}
