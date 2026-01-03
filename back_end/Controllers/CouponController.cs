using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SipSweet.Data;
using back_end.Models;

namespace back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CouponController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Coupon/validate/{code} - Validate coupon code
        [HttpGet("validate/{code}")]
        public async Task<ActionResult> ValidateCoupon(string code)
        {
            var coupon = await _context.Coupons
                .FirstOrDefaultAsync(c => c.Name.ToLower() == code.ToLower() && c.IsActive == true);

            if (coupon == null)
            {
                return Ok(new { 
                    valid = false, 
                    message = "Invalid coupon code" 
                });
            }

            // Check if expired
            if (coupon.Valid.HasValue && coupon.Valid.Value < DateTime.Now.Date)
            {
                return Ok(new { 
                    valid = false, 
                    message = "This coupon has expired" 
                });
            }

            return Ok(new { 
                valid = true, 
                message = "Coupon applied successfully!",
                coupon = new {
                    code = coupon.Name,
                    type = coupon.Type,
                    value = coupon.Value
                }
            });
        }

        // GET: api/Coupon - Get all active coupons (for admin)
        [HttpGet]
        public async Task<ActionResult<List<Coupon>>> GetAllCoupons()
        {
            var coupons = await _context.Coupons
                .Where(c => c.IsActive == true)
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(coupons);
        }

        // GET: api/Coupon/{id} - Get coupon by ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Coupon>> GetCoupon(long id)
        {
            var coupon = await _context.Coupons.FindAsync(id);

            if (coupon == null)
            {
                return NotFound(new { message = "Coupon not found" });
            }

            return Ok(coupon);
        }

        // POST: api/Coupon - Create new coupon (admin only)
        [HttpPost]
        public async Task<ActionResult<Coupon>> CreateCoupon([FromBody] Coupon coupon)
        {
            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCoupon), new { id = coupon.CouponId }, coupon);
        }

        // PUT: api/Coupon/{id} - Update coupon (admin only)
        [HttpPut("{id}")]
        public async Task<ActionResult> UpdateCoupon(long id, [FromBody] Coupon coupon)
        {
            if (id != coupon.CouponId)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            _context.Entry(coupon).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!await _context.Coupons.AnyAsync(c => c.CouponId == id))
                {
                    return NotFound(new { message = "Coupon not found" });
                }
                throw;
            }

            return Ok(new { message = "Coupon updated successfully" });
        }

        // DELETE: api/Coupon/{id} - Deactivate coupon (admin only)
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeactivateCoupon(long id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null)
            {
                return NotFound(new { message = "Coupon not found" });
            }

            coupon.IsActive = false;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Coupon deactivated successfully" });
        }
    }
}
