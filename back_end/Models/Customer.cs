using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SipSweet.Models
{
    [Table("customer")]
    public class Customer
    {
        [Key]
        public long customerid { get; set; }
        
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
        
        [StringLength(20)]
        public string? phone { get; set; }
        
        [Column("DOB")]
        public DateTime? DOB { get; set; }
        
        public string? gender { get; set; }
        
        public DateTime? created_at { get; set; }
        
        public string? status { get; set; }
    }
}

