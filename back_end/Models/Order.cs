using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SipSweet.Models;

namespace back_end.Models
{
    [Table("order")]
    public class Order
    {
        [Key]
        [Column("orderid")]
        public long OrderId { get; set; }

        [Column("customerid")]
        public long CustomerId { get; set; }

        [Column("restaurantid")]
        public long RestaurantId { get; set; }

        [Column("delivery_address")]
        public string? DeliveryAddress { get; set; }

        [Column("order_at")]
        public DateTime? OrderAt { get; set; }

        [Column("status")]
        [StringLength(50)]
        public string? Status { get; set; }

        [Column("subtotal", TypeName = "decimal(10,2)")]
        public decimal? Subtotal { get; set; }

        [Column("delivery_fee", TypeName = "decimal(10,2)")]
        public decimal? DeliveryFee { get; set; }

        [Column("discount", TypeName = "decimal(10,2)")]
        public decimal? Discount { get; set; }

        [Column("total", TypeName = "decimal(10,2)")]
        public decimal Total { get; set; }

        [Column("coupon_code")]
        [StringLength(50)]
        public string? CouponCode { get; set; }

        [Column("notes")]
        public string? Notes { get; set; }

        // Navigation properties
        [ForeignKey("CustomerId")]
        public virtual Customer? Customer { get; set; }

        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}