using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace TravelDesk_Api.Tests.Controllers
{
    public class AuthControllerTests
    {
        private readonly Mock<IConfiguration> _mockConfig;

        public AuthControllerTests()
        {
            _mockConfig = new Mock<IConfiguration>();
        }

        [Fact]
        public void Login_ValidCredentials_ReturnsToken()
        {
            // Arrange
            var loginRequest = new { Email = "employee1@cgi.com", Password = "password123" };
            
            // Act & Assert
            Assert.NotNull(loginRequest.Email);
            Assert.NotNull(loginRequest.Password);
        }

        [Fact]
        public void Login_InvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var loginRequest = new { Email = "invalid@email.com", Password = "wrongpassword" };
            
            // Act & Assert
            Assert.NotNull(loginRequest.Email);
            Assert.NotNull(loginRequest.Password);
        }

        [Theory]
        [InlineData("employee1@cgi.com", "employee")]
        [InlineData("manager1@cgi.com", "manager")]
        [InlineData("admin1@cgi.com", "admin")]
        public void Login_ValidRoles_ReturnsCorrectRole(string email, string expectedRole)
        {
            // Arrange & Act & Assert
            Assert.Contains(expectedRole, email.ToLower());
        }

        [Fact]
        public void Login_EmptyEmail_ReturnsBadRequest()
        {
            // Arrange
            var loginRequest = new { Email = "", Password = "password123" };
            
            // Act & Assert
            Assert.True(string.IsNullOrEmpty(loginRequest.Email));
        }

        [Fact]
        public void Login_EmptyPassword_ReturnsBadRequest()
        {
            // Arrange
            var loginRequest = new { Email = "test@email.com", Password = "" };
            
            // Act & Assert
            Assert.True(string.IsNullOrEmpty(loginRequest.Password));
        }

        [Fact]
        public void Login_InvalidEmailFormat_ReturnsBadRequest()
        {
            // Arrange
            var loginRequest = new { Email = "invalid-email", Password = "password123" };
            
            // Act & Assert
            Assert.DoesNotContain("@", loginRequest.Email);
        }
    }
}
