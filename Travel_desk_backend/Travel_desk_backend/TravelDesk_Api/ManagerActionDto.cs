using System.ComponentModel.DataAnnotations;

public class ManagerActionDto
{
    [Required]
    public string Action { get; set; } // "Approve", "Disapprove", or "Return to Employee"

    [Required]
    public string Comments { get; set; }
}