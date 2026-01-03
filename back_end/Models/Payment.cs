using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using SipSweet.Models;

namespace back_end.Models
{
    [Table("payment")]
    public class Payment
    {
        [Key]
        [Column("paymentid")]
        public long PaymentId { get; set; }

        [Column("customerid")]
        public long CustomerId { get; set; }

        [Column("orderid")]
        public long OrderId { get; set; }

        [Column("method")]
        [MaxLength(50)]
        public string Method { get; set; } = "cod"; // "cod" hoặc "bank"

        [Column("amount")]
        [Required]
        public decimal Amount { get; set; }

        [Column("status")]
        [MaxLength(50)]
        public string Status { get; set; } = "pending"; // "pending", "completed", "failed"

        [Column("transaction_date")]
        public DateTime? TransactionDate { get; set; }

        [Column("txn_ref")]
        [MaxLength(100)]
        public string? TxnRef { get; set; } // Mã giao dịch (ví dụ: "SIPSWEET 12345")

        // Navigation properties
        [ForeignKey("CustomerId")]
        public virtual Customer? Customer { get; set; }

        [ForeignKey("OrderId")]
        public virtual Order? Order { get; set; }
    }
}
