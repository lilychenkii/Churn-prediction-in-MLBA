using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SipSweet.Models
{
    [Table("admin")]
    public class Admin
    {
        [Key]
        public long adminid { get; set; }
        
        [Required]
        [StringLength(50)]
        public string username { get; set; } = string.Empty;
        
        [Required]
        [StringLength(255)]
        public string password { get; set; } = string.Empty;

        [Required]
        [StringLength(255)]
        public string full_name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string email { get; set; } = string.Empty;

        public DateTime? created_at { get; set; }
        
        public string? status { get; set; }
    }
}

