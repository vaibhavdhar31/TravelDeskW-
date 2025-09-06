using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelDesk_Api.Models
{
    public class User
    {

        [Key]
        public int UserId { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public byte[] PasswordHash { get; set; }

        public int RoleId { get; set; }

        [ForeignKey("RoleId")]
        public Role Role { get; set; }

        // User grid properties
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? EmployeeId { get; set; }
        public string? Department { get; set; }

        // Self-referencing foreign key for Manager
        public int? ManagerId { get; set; }

        [ForeignKey("ManagerId")]
        public User? Manager { get; set; }

        public ICollection<User>? Subordinates { get; set; }
    }
}
