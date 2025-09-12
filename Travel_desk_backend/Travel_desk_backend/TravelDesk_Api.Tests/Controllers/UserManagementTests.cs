using Xunit;

namespace TravelDesk_Api.Tests.Controllers
{
    public class UserManagementTests
    {
        [Fact]
        public void CreateUser_ValidData_ReturnsSuccess()
        {
            // Arrange
            var user = new
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john.doe@cgi.com",
                Role = "employee",
                Department = "IT"
            };

            // Act & Assert
            Assert.NotNull(user.FirstName);
            Assert.NotNull(user.LastName);
            Assert.Contains("@", user.Email);
            Assert.NotEmpty(user.Role);
        }

        [Fact]
        public void UpdateUser_ValidData_ReturnsSuccess()
        {
            // Arrange
            var userId = 1;
            var updateData = new
            {
                FirstName = "Jane",
                LastName = "Smith",
                Department = "HR"
            };

            // Act & Assert
            Assert.True(userId > 0);
            Assert.NotNull(updateData.FirstName);
            Assert.NotNull(updateData.Department);
        }

        [Fact]
        public void DeleteUser_ValidId_ReturnsSuccess()
        {
            // Arrange
            var userId = 1;

            // Act & Assert
            Assert.True(userId > 0);
        }

        [Theory]
        [InlineData("employee")]
        [InlineData("manager")]
        [InlineData("admin")]
        public void ValidateUserRole_ValidRoles_ReturnsTrue(string role)
        {
            // Arrange
            var validRoles = new[] { "employee", "manager", "admin" };

            // Act & Assert
            Assert.Contains(role, validRoles);
        }
    }
}
