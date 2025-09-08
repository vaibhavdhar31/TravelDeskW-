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
        public string? EmployeeId { get; set; }
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
                EmployeeId = userDto.EmployeeId,
                Department = userDto.Department,
                ManagerId = userDto.ManagerId
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(user);
        }

        // Edit/update user information
        [HttpPut("edit-user/{id}")]
        public async Task<IActionResult> EditUser(int id, [FromBody] EditUserDto updatedUserDto)
        {
            var userToUpdate = await _context.Users.FindAsync(id);
            if (userToUpdate == null)
            {
                return NotFound();
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
            _context.Users.Remove(userToDelete);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}
