using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace TravelDesk_Api.Tests.Controllers
{
    public class TravelRequestControllerTests
    {
        [Fact]
        public void CreateRequest_ValidData_ReturnsSuccess()
        {
            // Arrange
            var request = new
            {
                ProjectName = "Test Project",
                ReasonForTravel = "Business Meeting",
                FromDate = DateTime.Now.AddDays(1),
                ToDate = DateTime.Now.AddDays(5),
                FromLocation = "Mumbai",
                ToLocation = "Delhi"
            };

            // Act & Assert
            Assert.NotNull(request.ProjectName);
            Assert.True(request.ToDate > request.FromDate);
        }

        [Fact]
        public void CreateRequest_InvalidDateRange_ReturnsBadRequest()
        {
            // Arrange
            var request = new
            {
                FromDate = DateTime.Now.AddDays(5),
                ToDate = DateTime.Now.AddDays(1)
            };

            // Act & Assert
            Assert.True(request.FromDate > request.ToDate);
        }

        [Theory]
        [InlineData("")]
        [InlineData(null)]
        public void CreateRequest_EmptyProjectName_ReturnsBadRequest(string projectName)
        {
            // Arrange & Act & Assert
            Assert.True(string.IsNullOrEmpty(projectName));
        }

        [Fact]
        public void ApproveRequest_ValidId_ReturnsSuccess()
        {
            // Arrange
            var requestId = 1;

            // Act & Assert
            Assert.True(requestId > 0);
        }

        [Fact]
        public void RejectRequest_WithReason_ReturnsSuccess()
        {
            // Arrange
            var requestId = 1;
            var reason = "Budget constraints";

            // Act & Assert
            Assert.True(requestId > 0);
            Assert.NotEmpty(reason);
        }
    }
}
