using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq;
using TravelDesk_Api.Services;
using TravelDesk_Api.Models;

namespace TravelDesk_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // [Authorize(Roles = "HR Travel Admin")] // Temporarily disabled for testing
    public class TravelAdminController : ControllerBase
    {
        private readonly TravelDeskContext _context;
        private readonly IEmailService _emailService;

        public TravelAdminController(TravelDeskContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        // View a history of all travel requests
        [HttpGet("all-requests")]
        public async Task<IActionResult> GetAllRequests()
        {
            var allRequests = await _context.TravelRequests
                                            .Include(tr => tr.Comments)
                                            .Include(tr => tr.User)
                                            .OrderByDescending(tr => tr.RequestId)
                                            .ToListAsync();

            return Ok(allRequests);
        }        
        
        // Get documents for a specific request
        [HttpGet("request-documents/{id}")]
        public async Task<IActionResult> GetRequestDocuments(int id)
        {
            var request = await _context.TravelRequests
                                        .FirstOrDefaultAsync(tr => tr.RequestId == id);

            if (request == null)
            {
                return NotFound("Request not found.");
            }

            var documents = new List<object>();
            
            if (!string.IsNullOrEmpty(request.PassportFileUrl))
            {
                documents.Add(new { 
                    name = "Travel Documents", 
                    url = request.PassportFileUrl,
                    type = "booking"
                });
            }

            return Ok(documents);
        }

        // Perform an action on a travel request
        [HttpPost("action-request/{id}")]
        public async Task<IActionResult> ActionRequest(int id, [FromBody] TravelAdminActionDto actionDto)
        {
            var travelAdminIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            int travelAdminId = 1; // Temporarily use default

            var request = await _context.TravelRequests
                                        .Include(tr => tr.User)
                                        .FirstOrDefaultAsync(tr => tr.RequestId == id);

            if (request == null)
            {
                return NotFound("Request not found.");
            }

            // A comment is required for every action
            if (string.IsNullOrEmpty(actionDto.Comments))
            {
                return BadRequest("The comments section cannot be left blank.");
            }

            var newComment = new RequestComment
            {
                Comment = actionDto.Comments,
                RequestId = id,
                UserId = travelAdminId,
                Timestamp = DateTime.UtcNow
            };
            _context.RequestComments.Add(newComment);

            // Get employee and manager for email notifications
            var employee = request.User;
            var manager = await _context.Users.FirstOrDefaultAsync(u => u.UserId == employee.ManagerId);

            switch (actionDto.Action.ToLower())
            {
                case "approve":
                    request.Status = "Approved";
                    await SendEmailToEmployeeAndManager(employee, manager, id, "Travel Request Approved", $"<p>Travel request {id} has been approved by HR.</p><p>Comments: {actionDto.Comments}</p>");
                    break;
                    
                case "disapprove":
                    request.Status = "Disapproved";
                    await SendEmailToEmployeeAndManager(employee, manager, id, "Travel Request Disapproved", $"<p>Travel request {id} has been disapproved by HR.</p><p>Comments: {actionDto.Comments}</p>");
                    break;
                    
                case "book":
                    request.Status = "Booked";
                    await SendEmailToEmployeeAndManager(employee, manager, id, "Travel Request Booked", $"<p>Travel request {id} has been booked.</p><p>Comments: {actionDto.Comments}</p>");
                    break;
                    
                case "complete":
                    request.Status = "Completed";
                    await SendEmailToEmployeeAndManager(employee, manager, id, "Travel Request Completed", $"<p>Travel request {id} has been completed.</p><p>Comments: {actionDto.Comments}</p>");
                    break;
                    
                case "book ticket":
                    request.Status = "Completed";
                    request.PassportFileUrl = actionDto.TicketFileUrl; // Or a dedicated field for tickets
                    await SendEmailToEmployeeAndManager(employee, manager, id, "Travel Ticket Booked", $"<p>Ticket has been booked for travel request {id}.</p><p>Comments: {actionDto.Comments}</p>");
                    break;
                    
                case "return to manager":
                    request.Status = "Returned to Manager";
                    await SendEmailToEmployeeAndManager(employee, manager, id, "Travel Request Returned to Manager", $"<p>Travel request {id} has been returned to manager for review.</p><p>Comments: {actionDto.Comments}</p>");
                    break;
                    
                case "return to employee":
                    request.Status = "Returned to Employee";
                    await SendEmailToEmployeeAndManager(employee, manager, id, "Travel Request Returned to Employee", $"<p>Travel request {id} has been returned to employee for revision.</p><p>Comments: {actionDto.Comments}</p>");
                    break;
                    
                case "close":
                    request.Status = "Completed";
                    await SendEmailToEmployeeAndManager(employee, manager, id, "Travel Request Closed", $"<p>Travel request {id} has been closed.</p><p>Comments: {actionDto.Comments}</p>");
                    break;
                    
                default:
                    return BadRequest("Invalid action specified.");
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = $"Request {id} status updated to {request.Status}." });
        }

        private async Task SendEmailToEmployeeAndManager(User employee, User? manager, int requestId, string subject, string body)
        {
            // Send email to employee
            if (employee != null && !string.IsNullOrEmpty(employee.Email))
            {
                await _emailService.SendEmailAsync(employee.Email, subject, body);
            }

            // Send email to manager
            if (manager != null && !string.IsNullOrEmpty(manager.Email))
            {
                await _emailService.SendEmailAsync(manager.Email, subject, body);
            }
        }
    }
}
