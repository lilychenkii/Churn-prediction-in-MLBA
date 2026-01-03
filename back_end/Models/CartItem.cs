using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SipSweet.Models
{
    [Table("cart_item")]
    public class CartItem
    {
        [Key]
        [Column("cart_itemid")]
        public long cart_itemid { get; set; }
        
        [Column("customerid")]
        public long customerid { get; set; }
        
        [Column("itemid")]
        public long itemid { get; set; }
        
        [Column("quantity")]
        public int quantity { get; set; }

        [Column("added_at")]
        public DateTime? added_at { get; set; } // Thêm cột này

        // Navigation properties
        [ForeignKey("customerid")]
        public virtual Customer? customer { get; set; }
        
        [ForeignKey("itemid")]
        public virtual Item? item { get; set; }
    }
}