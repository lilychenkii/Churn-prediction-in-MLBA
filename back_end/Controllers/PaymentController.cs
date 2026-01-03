using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SipSweet.Data;
using back_end.Models;

namespace back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PaymentController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Payment/order/{orderId} - Lấy payment theo orderId
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<Payment>> GetPaymentByOrderId(long orderId)
        {
            var payment = await _context.Payments
                .Include(p => p.Customer)
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.OrderId == orderId);

            if (payment == null)
            {
                return NotFound(new { message = "Payment not found" });
            }

            return Ok(payment);
        }

        // GET: api/Payment/customer/{customerId} - Lấy tất cả payment của customer
        [HttpGet("customer/{customerId}")]
        public async Task<ActionResult<List<Payment>>> GetPaymentsByCustomerId(long customerId)
        {
            var payments = await _context.Payments
                .Include(p => p.Order)
                .Where(p => p.CustomerId == customerId)
                .OrderByDescending(p => p.TransactionDate)
                .ToListAsync();

            return Ok(payments);
        }

        // PATCH: api/Payment/{paymentId}/confirm - Admin xác nhận đã nhận tiền chuyển khoản
        [HttpPatch("{paymentId}/confirm")]
        public async Task<ActionResult> ConfirmPayment(long paymentId)
        {
            var payment = await _context.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.PaymentId == paymentId);

            if (payment == null)
            {
                return NotFound(new { message = "Payment not found" });
            }

            // Update payment status
            payment.Status = "completed";
            payment.TransactionDate = DateTime.Now;

            // Update order status
            if (payment.Order != null)
            {
                payment.Order.Status = "confirmed";
            }

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Payment confirmed successfully",
                payment = payment
            });
        }

        // GET: api/Payment/pending - Lấy tất cả payment đang chờ xác nhận (cho admin)
        [HttpGet("pending")]
        public async Task<ActionResult<List<Payment>>> GetPendingPayments()
        {
            var payments = await _context.Payments
                .Include(p => p.Customer)
                .Include(p => p.Order)
                .Where(p => p.Status == "pending")
                .OrderByDescending(p => p.TransactionDate)
                .ToListAsync();

            return Ok(payments);
        }
    }
}
