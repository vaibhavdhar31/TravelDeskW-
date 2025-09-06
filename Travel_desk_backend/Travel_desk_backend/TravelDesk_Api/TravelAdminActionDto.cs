using System.ComponentModel.DataAnnotations;

public class TravelAdminActionDto
{
    [Required]
    public string Action { get; set; } // e.g., "Book Ticket", "Return to Manager", "Return to Employee", "Close"

    [Required]
    public string Comments { get; set; }

    public string? TicketFileUrl { get; set; }
}