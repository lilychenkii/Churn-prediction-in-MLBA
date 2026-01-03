using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_end.Models
{
    [Table("coupon")]
    public class Coupon
    {
        [Key]
        [Column("couponid")]
        public long CouponId { get; set; }

        [Column("name")]
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;

        [Column("type")]
        [MaxLength(50)]
        public string? Type { get; set; } // "percentage", "fixed", "shipping"

        [Column("value")]
        [Required]
        public decimal Value { get; set; }

        [Column("valid")]
        public DateTime? Valid { get; set; }

        [Column("is_active")]
        public bool? IsActive { get; set; }
    }
}
