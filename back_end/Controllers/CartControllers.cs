using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SipSweet.Data;
using SipSweet.Models;

namespace SipSweet.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Cart/{customerId}
        [HttpGet("{customerId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetCart(long customerId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Where(c => c.customerid == customerId)
                    .Include(c => c.item)
                    .OrderByDescending(c => c.added_at) // ✅ Sort by newest first
                    .ToListAsync();

                if (!cartItems.Any())
                {
                    return Ok(new List<object>());
                }

                var response = cartItems.Select(c => new
                {
                    cart_itemid = c.cart_itemid,
                    itemid = c.itemid,
                    quantity = c.quantity,
                    added_at = c.added_at, // Include added_at in response
                    product = new
                    {
                        id = c.item?.itemid ?? 0,
                        name = c.item?.name ?? "Unknown",
                        price = c.item?.price ?? 0,
                        imageUrl = c.item?.image_url ?? "/images/default.jpg"
                    }
                }).ToList();

                return Ok(response);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ GetCart Error: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error loading cart", error = ex.Message });
            }
        }

        // POST: api/Cart
        [HttpPost]
        public async Task<ActionResult> AddToCart([FromBody] CartItemRequest request)
        {
            try
            {
                Console.WriteLine($"🛒 AddToCart: customerId={request.customerId}, itemId={request.itemId}, qty={request.quantity}");

                // Validate customer exists
                var customerExists = await _context.Customers.AnyAsync(c => c.customerid == request.customerId);
                if (!customerExists)
                {
                    Console.WriteLine($"Customer not found: {request.customerId}");
                    return NotFound(new { message = "Customer not found", success = false });
                }

                // Validate item exists
                var itemExists = await _context.Items.AnyAsync(i => i.itemid == request.itemId);
                if (!itemExists)
                {
                    Console.WriteLine($"Item not found: {request.itemId}");
                    return NotFound(new { message = "Product not found", success = false });
                }

                // Check if item already in cart
                var existingCartItem = await _context.CartItems
                    .FirstOrDefaultAsync(c => c.customerid == request.customerId && c.itemid == request.itemId);

                if (existingCartItem != null)
                {
                    Console.WriteLine($"Updating quantity: {existingCartItem.quantity} + {request.quantity}");
                    existingCartItem.quantity += request.quantity;
                    // Update added_at to current time when updating
                    existingCartItem.added_at = DateTime.Now;
                    _context.CartItems.Update(existingCartItem);
                }
                else
                {
                    Console.WriteLine($"Adding new cart item");
                    var newCartItem = new CartItem
                    {
                        customerid = request.customerId,
                        itemid = request.itemId,
                        quantity = request.quantity,
                        added_at = DateTime.Now // Set added_at khi tạo mới
                    };
                    _context.CartItems.Add(newCartItem);
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"Cart saved successfully");

                return Ok(new { message = "Added to cart successfully", success = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AddToCart Error: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Error adding to cart", error = ex.Message, success = false });
            }
        }

        // PUT: api/Cart/{cartItemId}
        [HttpPut("{cartItemId}")]
        public async Task<ActionResult> UpdateCartItem(long cartItemId, [FromBody] UpdateCartRequest request)
        {
            try
            {
                var cartItem = await _context.CartItems.FindAsync(cartItemId);
                if (cartItem == null)
                    return NotFound(new { message = "Cart item not found", success = false });

                cartItem.quantity = request.quantity;
                // ✅ Update added_at when quantity changes
                cartItem.added_at = DateTime.Now;
                
                _context.CartItems.Update(cartItem);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Updated cart item {cartItemId} to quantity {request.quantity}");

                return Ok(new { message = "Cart updated", success = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"UpdateCartItem Error: {ex.Message}");
                return StatusCode(500, new { message = "Error updating cart", error = ex.Message, success = false });
            }
        }

        // DELETE: api/Cart/{cartItemId}
        [HttpDelete("{cartItemId}")]
        public async Task<ActionResult> RemoveFromCart(long cartItemId)
        {
            try
            {
                var cartItem = await _context.CartItems.FindAsync(cartItemId);
                if (cartItem == null)
                    return NotFound(new { message = "Cart item not found", success = false });

                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Removed cart item {cartItemId}");

                return Ok(new { message = "Removed from cart", success = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"RemoveFromCart Error: {ex.Message}");
                return StatusCode(500, new { message = "Error removing from cart", error = ex.Message, success = false });
            }
        }

        // DELETE: api/Cart/clear/{customerId}
        [HttpDelete("clear/{customerId}")]
        public async Task<ActionResult> ClearCart(long customerId)
        {
            try
            {
                var cartItems = await _context.CartItems
                    .Where(c => c.customerid == customerId)
                    .ToListAsync();

                _context.CartItems.RemoveRange(cartItems);
                await _context.SaveChangesAsync();

                Console.WriteLine($"Cleared {cartItems.Count} items from cart for customer {customerId}");

                return Ok(new { message = "Cart cleared", success = true });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ClearCart Error: {ex.Message}");
                return StatusCode(500, new { message = "Error clearing cart", error = ex.Message, success = false });
            }
        }
    }

    // Request DTOs
    public class CartItemRequest
    {
        public long customerId { get; set; }
        public long itemId { get; set; }
        public int quantity { get; set; }
    }

    public class UpdateCartRequest
    {
        public int quantity { get; set; }
    }
}