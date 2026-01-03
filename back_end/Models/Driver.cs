using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_end.Models
{
    [Table("driver")]
    public class Driver
    {
        [Key]
        [Column("driverid")]
        public long DriverId { get; set; }

        [Required]
        [Column("full_name")]
        [StringLength(255)]
        public string FullName { get; set; } = string.Empty;

        [Column("email")]
        [StringLength(255)]
        public string? Email { get; set; }

        [Column("phone")]
        [StringLength(20)]
        public string? Phone { get; set; }

        [Column("dob")]
        public DateTime? Dob { get; set; }

        [Column("gender")]
        [StringLength(50)]
        public string? Gender { get; set; }

        [Column("status")]
        [StringLength(50)]
        public string Status { get; set; } = "Available";

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        [Column("vehicle_type")]
        [StringLength(50)]
        public string? VehicleType { get; set; }

        [Column("plate_number")]
        [StringLength(20)]
        public string? PlateNumber { get; set; }

        [Column("rating_avg")]
        public decimal? RatingAvg { get; set; }

        [Column("rating_count")]
        public int? RatingCount { get; set; }
    }
}
