using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SipSweet.Data;
using SipSweet.Models;

namespace SipSweet.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Product - Lấy danh sách sản phẩm với phân trang
        [HttpGet]
        public async Task<ActionResult<object>> GetAllProducts(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] long? categoryId = null,
            [FromQuery] string? search = null,
            [FromQuery] bool? available = null)
        {
            try
            {
                if (page < 1) page = 1;
                if (pageSize < 1 || pageSize > 100) pageSize = 10;

                var query = _context.Items.AsQueryable();

                // Filter by category
                if (categoryId.HasValue)
                {
                    query = query.Where(p => p.categoryid == categoryId.Value);
                }

                // Filter by availability
                if (available.HasValue)
                {
                    query = query.Where(p => p.available == available.Value);
                }

                // Search by name
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(p => p.name.Contains(search));
                }

                // Order by name
                query = query.OrderBy(p => p.name);

                var totalCount = await query.CountAsync();
                var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

                var products = await query
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var response = new
                {
                    products = products,
                    pagination = new
                    {
                        currentPage = page,
                        totalPages = totalPages,
                        totalCount = totalCount,
                        pageSize = pageSize,
                        hasPrevious = page > 1,
                        hasNext = page < totalPages
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving products", error = ex.Message });
            }
        }

        // GET: api/Product/all - Lấy tất cả sản phẩm (không phân trang) - để tương thích với frontend hiện tại
        [HttpGet("all")]
        public async Task<ActionResult<IEnumerable<Item>>> GetAllProductsNoPagination()
        {
            try
            {
                var products = await _context.Items.ToListAsync();
                return Ok(products);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving products", error = ex.Message });
            }
        }

        // GET: api/Product/{id} - Lấy chi tiết sản phẩm theo ID
        [HttpGet("{id}")]
        public async Task<ActionResult<Item>> GetProduct(long id)
        {
            try
            {
                var product = await _context.Items.FindAsync(id);

                if (product == null)
                {
                    return NotFound(new { message = "Product not found" });
                }

                return Ok(product);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving product", error = ex.Message });
            }
        }

        // POST: api/Product - Thêm sản phẩm mới
        [HttpPost]
        public async Task<ActionResult<Item>> CreateProduct([FromBody] Item item)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                _context.Items.Add(item);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetProduct), new { id = item.itemid }, item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating product", error = ex.Message });
            }
        }

        // PUT: api/Product/{id} - Cập nhật sản phẩm
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(long id, [FromBody] Item item)
        {
            try
            {
                if (id != item.itemid)
                {
                    return BadRequest(new { message = "Product ID mismatch" });
                }

                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var existingProduct = await _context.Items.FindAsync(id);
                if (existingProduct == null)
                {
                    return NotFound(new { message = "Product not found" });
                }

                // Cập nhật các trường
                existingProduct.name = item.name;
                existingProduct.price = item.price;
                existingProduct.image_url = item.image_url;
                existingProduct.descriptionname = item.descriptionname;
                existingProduct.restaurantid = item.restaurantid;
                existingProduct.categoryid = item.categoryid;
                existingProduct.available = item.available;
                existingProduct.rating_avg = item.rating_avg;
                existingProduct.rating_count = item.rating_count;

                await _context.SaveChangesAsync();

                return Ok(existingProduct);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating product", error = ex.Message });
            }
        }

        // DELETE: api/Product/{id} - Xóa sản phẩm
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(long id)
        {
            try
            {
                var product = await _context.Items.FindAsync(id);
                if (product == null)
                {
                    return NotFound(new { message = "Product not found" });
                }

                _context.Items.Remove(product);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Product deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting product", error = ex.Message });
            }
        }
    }
}

