using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Linq;

namespace TravelDesk_Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Manager")]
    public class ManagerController : ControllerBase
    {
        private readonly TravelDeskContext _context;

        public ManagerController(TravelDeskContext context)
        {
            _context = context;
        }

        // View assigned requests
        [HttpGet("my-requests")]
        public async Task<IActionResult> GetAssignedRequests()
        {
            var managerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (managerIdClaim == null) return Unauthorized("Manager ID not found in token.");
            int managerId = int.Parse(managerIdClaim.Value);

            var assignedRequests = await _context.TravelRequests
                                                 .Include(tr => tr.Comments)
                                                 .Include(tr => tr.User)
                                                 .Where(tr => tr.User.ManagerId == managerId)
                                                 .ToListAsync();

            return Ok(assignedRequests);
        }

        // Get pending requests for manager dashboard
        [HttpGet("pending-requests")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var managerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (managerIdClaim == null) return Unauthorized("Manager ID not found in token.");
            int managerId = int.Parse(managerIdClaim.Value);

            var pendingRequests = await _context.TravelRequests
                                                .Include(tr => tr.User)
                                                .Where(tr => tr.Status == "Pending" && tr.User.ManagerId == managerId)
                                                .ToListAsync();

            return Ok(pendingRequests);
        }

        // Perform an action on a request
        [HttpPost("action-request/{id}")]
        public async Task<IActionResult> ActionRequest(int id, [FromBody] ManagerActionDto actionDto)
        {
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

            var managerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            int managerId = managerIdClaim != null ? int.Parse(managerIdClaim.Value) : 1; // Default to 1 if no claim

            var newComment = new RequestComment
            {
                Comment = actionDto.Comments,
                RequestId = id,
                UserId = managerId,
                Timestamp = DateTime.UtcNow
            };
            _context.RequestComments.Add(newComment);

            switch (actionDto.Action.ToLower())
            {
                case "approve":
                    request.Status = "Manager Approved"; // Clear status for travel admin
                    break;
                case "disapprove":
                    request.Status = "Disapproved";
                    break;
                case "return":
                case "return to employee":
                    request.Status = "Returned to Employee";
                    break;
                default:
                    return BadRequest("Invalid action specified.");
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = $"Request {id} status updated to {request.Status}." });
        }
    }
}
