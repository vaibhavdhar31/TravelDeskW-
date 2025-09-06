using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TravelDesk_Api.Models;

public class TravelRequest
{
    [Key]
    public int RequestId { get; set; }

    [Required]
    public string EmployeeId { get; set; }

    [Required]
    public string ProjectName { get; set; }

    [Required]
    public string DepartmentName { get; set; }

    [Required]
    public string ReasonForTravelling { get; set; }

    [Required]
    public string TypeOfBooking { get; set; }

    public string? FlightType { get; set; }

    public string? Dates { get; set; }

    public string? AadhaarNumber { get; set; }

    public string? PassportNumber { get; set; }

    public string? VisaFileUrl { get; set; }

    public string? PassportFileUrl { get; set; }

    public int? DaysOfStay { get; set; }

    public string? MealRequired { get; set; }

    public string? MealPreference { get; set; }

    [Required]
    public string Status { get; set; }

    public int UserId { get; set; }

    [ForeignKey("UserId")]
    public User User { get; set; }

    public ICollection<RequestComment> Comments { get; set; }

    // New fields for Manager-specific tracking
    public int? ManagerId { get; set; }

    [ForeignKey("ManagerId")]
    public User? Manager { get; set; }
}