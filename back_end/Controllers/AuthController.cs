using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SipSweet.Data;
using SipSweet.Models;
using SipSweet.Models.DTOs;

namespace SipSweet.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Auth/login/customer
        [HttpPost("login/customer")]
        public async Task<ActionResult<LoginResponse>> CustomerLogin([FromBody] LoginRequest request)
        {
            try
            {
                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.username == request.username);

                if (customer == null || customer.password != request.password)
                {
                    return Ok(new LoginResponse
                    {
                        success = false,
                        message = "Tên đăng nhập hoặc mật khẩu không đúng!"
                    });
                }

                // Check status
                if (customer.status != null && customer.status.ToLower() != "active")
                {
                    return Ok(new LoginResponse
                    {
                        success = false,
                        message = "Tài khoản của bạn đã bị khóa!"
                    });
                }

                return Ok(new LoginResponse
                {
                    success = true,
                    message = "Đăng nhập thành công!",
                    user = new UserData
                    {
                        id = customer.customerid,
                        username = customer.username,
                        full_name = customer.full_name,
                        email = customer.email,
                        phone = customer.phone,
                        role = "customer"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new LoginResponse
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        // POST: api/Auth/login/admin
        [HttpPost("login/admin")]
        public async Task<ActionResult<LoginResponse>> AdminLogin([FromBody] LoginRequest request)
        {
            try
            {
                var admin = await _context.Admins
                    .FirstOrDefaultAsync(a => a.username == request.username);

                if (admin == null || admin.password != request.password)
                {
                    return Ok(new LoginResponse
                    {
                        success = false,
                        message = "Tên đăng nhập hoặc mật khẩu không đúng!"
                    });
                }

                // Check status
                if (admin.status != null && admin.status.ToLower() != "active")
                {
                    return Ok(new LoginResponse
                    {
                        success = false,
                        message = "Tài khoản admin đã bị khóa!"
                    });
                }

                return Ok(new LoginResponse
                {
                    success = true,
                    message = "Đăng nhập thành công!",
                    user = new UserData
                    {
                        id = admin.adminid,
                        username = admin.username,
                        full_name = admin.full_name,
                        email = admin.email,
                        role = "admin"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new LoginResponse
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        // POST: api/Auth/signup/customer
        [HttpPost("signup/customer")]
        public async Task<ActionResult<SignupResponse>> CustomerSignup([FromBody] CustomerSignupRequest request)
        {
            try
            {
                // Check if username already exists
                var existingUsername = await _context.Customers
                    .AnyAsync(c => c.username == request.username);
                if (existingUsername)
                {
                    return Ok(new SignupResponse
                    {
                        success = false,
                        message = "Tên đăng nhập đã tồn tại!"
                    });
                }

                // Check if email already exists
                var existingEmail = await _context.Customers
                    .AnyAsync(c => c.email == request.email);
                if (existingEmail)
                {
                    return Ok(new SignupResponse
                    {
                        success = false,
                        message = "Email đã được sử dụng!"
                    });
                }

                // Create new customer
                var newCustomer = new Customer
                {
                    username = request.username,
                    password = request.password, // In production, should hash the password
                    full_name = request.full_name,
                    email = request.email,
                    phone = request.phone,
                    DOB = request.DOB,
                    gender = request.gender,
                    created_at = DateTime.Now,
                    status = "active"
                };

                _context.Customers.Add(newCustomer);
                await _context.SaveChangesAsync();

                return Ok(new SignupResponse
                {
                    success = true,
                    message = "Đăng ký thành công!",
                    user = new UserData
                    {
                        id = newCustomer.customerid,
                        username = newCustomer.username,
                        full_name = newCustomer.full_name,
                        email = newCustomer.email,
                        phone = newCustomer.phone,
                        role = "customer"
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new SignupResponse
                {
                    success = false,
                    message = $"Lỗi server: {ex.Message}"
                });
            }
        }

        // GET: api/Auth/test
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "Auth API is working!" });
        }
    }
}

