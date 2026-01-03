using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_end.Models
{
    [Table("delivery")]
    public class Delivery
    {
        [Key]
        [Column("deliveryid")]
        public long DeliveryId { get; set; }

        [Required]
        [Column("orderid")]
        public long OrderId { get; set; }

        [Required]
        [Column("driverid")]
        public long DriverId { get; set; }

        [Column("pickup_time")]
        public DateTime? PickupTime { get; set; }

        [Column("dropoff_time")]
        public DateTime? DropoffTime { get; set; }

        [Column("status")]
        [StringLength(50)]
        public string Status { get; set; } = "Pending";

        [Column("distance")]
        public decimal? Distance { get; set; }

        [Column("driver_fee")]
        public decimal? DriverFee { get; set; }

        // Navigation properties
        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }

        [ForeignKey("DriverId")]
        public virtual Driver? Driver { get; set; }
    }
}
