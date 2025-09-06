using System.ComponentModel.DataAnnotations;

namespace TravelDesk_Api.Models
{
    public class Role
    {

        [Key]
        public int RoleId { get; set; }

        [Required]
        [MaxLength(50)]
        public string RoleName { get; set; }

        public ICollection<User> Users { get; set; }
    }
}
