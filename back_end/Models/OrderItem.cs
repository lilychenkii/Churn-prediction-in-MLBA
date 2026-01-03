using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SipSweet.Models;

namespace back_end.Models
{
    [Table("order_item")]
    public class OrderItem
    {
        [Key]
        [Column("order_itemid")]
        public long OrderItemId { get; set; }

        [Column("orderid")]
        public long OrderId { get; set; }

        [Column("itemid")]
        public long ItemId { get; set; }

        [Column("quantity")]
        public int? Quantity { get; set; }

        [Column("unit_price", TypeName = "decimal(10,2)")]
        public decimal UnitPrice { get; set; }

        [Column("line_total", TypeName = "decimal(10,2)")]
        public decimal? LineTotal { get; set; }

        // Navigation properties
        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }

        [ForeignKey("ItemId")]
        public virtual Item? Item { get; set; }
    }
}