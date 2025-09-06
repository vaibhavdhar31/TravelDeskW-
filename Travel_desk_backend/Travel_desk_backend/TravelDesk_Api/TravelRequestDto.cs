using System.ComponentModel.DataAnnotations;

public class TravelRequestDto
{
    [Required]
    public required string EmployeeId { get; set; }

    [Required]
    public required string ProjectName { get; set; }

    [Required]
    public required string DepartmentName { get; set; }

    [Required]
    public required string ReasonForTravelling { get; set; }

    [Required]
    public required string TypeOfBooking { get; set; }

    public string? FlightType { get; set; }

    public string? Dates { get; set; }

    public string? AadhaarNumber { get; set; }

    public string? PassportNumber { get; set; }

    public string? VisaFileUrl { get; set; }

    public string? PassportFileUrl { get; set; }

    public int? DaysOfStay { get; set; }

    public string? MealRequired { get; set; }

    public string? MealPreference { get; set; }
}