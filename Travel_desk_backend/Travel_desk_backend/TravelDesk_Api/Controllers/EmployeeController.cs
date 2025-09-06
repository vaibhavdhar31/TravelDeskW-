using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using TravelDesk_Api.Models;
using System.Security.Claims;

namespace TravelDesk_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Employee")]
    public class EmployeeController : ControllerBase
    {
        private readonly TravelDeskContext _context;

        public EmployeeController(TravelDeskContext context)
        {
            _context = context;
        }

        [HttpPost("create-request")]
        public async Task<IActionResult> CreateRequest([FromBody] TravelRequestDto requestDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("User ID not found in token.");
            int userId = int.Parse(userIdClaim.Value);

            var travelRequest = new TravelRequest
            {
                UserId = userId,
                EmployeeId = requestDto.EmployeeId,
                ProjectName = requestDto.ProjectName,
                DepartmentName = requestDto.DepartmentName,
                ReasonForTravelling = requestDto.ReasonForTravelling,
                TypeOfBooking = requestDto.TypeOfBooking,
                FlightType = requestDto.FlightType,
                Dates = requestDto.Dates,
                AadhaarNumber = requestDto.AadhaarNumber,
                PassportNumber = requestDto.PassportNumber,
                VisaFileUrl = requestDto.VisaFileUrl,
                PassportFileUrl = requestDto.PassportFileUrl,
                DaysOfStay = requestDto.DaysOfStay,
                MealRequired = requestDto.MealRequired,
                MealPreference = requestDto.MealPreference,
                Status = "Pending"
            };

            _context.TravelRequests.Add(travelRequest);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Request submitted successfully.", RequestId = travelRequest.RequestId });
        }

        [HttpGet("my-requests")]
        public async Task<IActionResult> GetMyRequests()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("User ID not found in token.");
            int userId = int.Parse(userIdClaim.Value);

            var requests = await _context.TravelRequests
                                         .Include(tr => tr.Comments)
                                         .Where(tr => tr.UserId == userId)
                                         .OrderByDescending(tr => tr.RequestId)
                                         .ToListAsync();

            return Ok(requests);
        }

        [HttpPut("edit-request/{id}")]
        public async Task<IActionResult> EditRequest(int id, [FromBody] TravelRequestDto updatedRequest)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("User ID not found in token.");
            int userId = int.Parse(userIdClaim.Value);

            var requestToEdit = await _context.TravelRequests.FindAsync(id);

            if (requestToEdit == null || requestToEdit.UserId != userId)
            {
                return NotFound("Request not found or you do not have permission to edit it.");
            }

            if (requestToEdit.Status != "Returned to Employee")
            {
                return BadRequest("This request cannot be edited in its current status.");
            }

            requestToEdit.ProjectName = updatedRequest.ProjectName;
            requestToEdit.DepartmentName = updatedRequest.DepartmentName;
            requestToEdit.ReasonForTravelling = updatedRequest.ReasonForTravelling;
            requestToEdit.TypeOfBooking = updatedRequest.TypeOfBooking;
            requestToEdit.FlightType = updatedRequest.FlightType;
            requestToEdit.Dates = updatedRequest.Dates;
            requestToEdit.AadhaarNumber = updatedRequest.AadhaarNumber;
            requestToEdit.PassportNumber = updatedRequest.PassportNumber;
            requestToEdit.VisaFileUrl = updatedRequest.VisaFileUrl;
            requestToEdit.PassportFileUrl = updatedRequest.PassportFileUrl;
            requestToEdit.DaysOfStay = updatedRequest.DaysOfStay;
            requestToEdit.MealRequired = updatedRequest.MealRequired;
            requestToEdit.MealPreference = updatedRequest.MealPreference;
            requestToEdit.Status = "Pending";

            await _context.SaveChangesAsync();

            return Ok(requestToEdit);
        }

        [HttpDelete("delete-request/{id}")]
        public async Task<IActionResult> DeleteRequest(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null) return Unauthorized("User ID not found in token.");
            int userId = int.Parse(userIdClaim.Value);

            var requestToDelete = await _context.TravelRequests.FindAsync(id);

            if (requestToDelete == null || requestToDelete.UserId != userId)
            {
                return NotFound("Request not found or you do not have permission to delete it.");
            }

            _context.TravelRequests.Remove(requestToDelete);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}