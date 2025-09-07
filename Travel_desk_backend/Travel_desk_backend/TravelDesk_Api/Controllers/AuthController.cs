using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using BCrypt.Net;
using Microsoft.EntityFrameworkCore;
using TravelDesk_Api.Services;

namespace TravelDesk_Api
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly TravelDeskContext _context;
        private readonly IJwtService _jwtService;

        public AuthController(TravelDeskContext context, IJwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            try
            {
                // Find the user by email
                var user = await _context.Users.Include(u => u.Role)
                                               .FirstOrDefaultAsync(u => u.Email == request.Email);

                // Validate credentials
                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, Encoding.UTF8.GetString(user.PasswordHash)))
                {
                    return Unauthorized(new { message = "Invalid email or password" });
                }

                // Generate JWT token using the service
                var token = _jwtService.GenerateToken(user.UserId, user.Email, user.Role.RoleName);

                return Ok(new 
                { 
                    token = token, 
                    role = user.Role.RoleName.ToLower().Replace(" ", "-"),
                    userId = user.UserId,
                    email = user.Email,
                    employeeId = user.EmployeeId,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    department = user.Department,
                    expiresIn = 28800 // 8 hours in seconds
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login", error = ex.Message });
            }
        }

        [HttpPost("validate-token")]
        [Authorize]
        public IActionResult ValidateToken()
        {
            return Ok(new { message = "Token is valid", userId = User.Identity?.Name });
        }

        // Temporary GET endpoint to generate a password hash (remove in production)
        [HttpGet("generate-hash")]
        public IActionResult GenerateHash(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                return BadRequest("Password cannot be empty.");
            }
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
            return Ok(new { hash = hashedPassword });
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
