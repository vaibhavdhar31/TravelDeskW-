public class AddUserDto
{
    public string Email { get; set; }
    public string Password { get; set; }
    public int RoleId { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? EmployeeId { get; set; }
    public string? Department { get; set; }
    public int? ManagerId { get; set; }
}