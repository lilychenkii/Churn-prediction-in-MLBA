using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SipSweet.Data;
using back_end.Models;
using back_end.Models.DTOs;
using SipSweet.Models;

namespace back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OrderController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Order - Tạo đơn hàng mới
        [HttpPost]
        public async Task<ActionResult<OrderResponseDTO>> CreateOrder([FromBody] OrderCreateDTO orderCreateDTO)
        {
            Console.WriteLine("CreateOrder called");
            Console.WriteLine($"Request data: {System.Text.Json.JsonSerializer.Serialize(orderCreateDTO)}");
            
            if (!ModelState.IsValid)
            {
                Console.WriteLine("ModelState invalid:");
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    Console.WriteLine($"  - {error.ErrorMessage}");
                }
                return BadRequest(ModelState);
            }

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Kiểm tra customer tồn tại
                var customer = await _context.Customers.FindAsync(orderCreateDTO.CustomerId);
                if (customer == null)
                {
                    return BadRequest(new { message = "Customer not found" });
                }

                // Tính tổng tiền
                decimal subtotal = 0;
                decimal deliveryFee = orderCreateDTO.DeliveryFee ?? 30000; // Dùng từ frontend, fallback 30000
                var orderItems = new List<OrderItem>();

                foreach (var itemDto in orderCreateDTO.Items)
                {
                    // Kiểm tra sản phẩm tồn tại và có sẵn
                    var item = await _context.Items.FindAsync(itemDto.ItemId);
                    if (item == null)
                    {
                        return BadRequest(new { message = $"Item with ID {itemDto.ItemId} not found" });
                    }

                    if (item.available != true)
                    {
                        return BadRequest(new { message = $"Item '{item.name}' is not available" });
                    }

                    var lineTotal = itemDto.UnitPrice * itemDto.Quantity;
                    var orderItem = new OrderItem
                    {
                        ItemId = itemDto.ItemId,
                        Quantity = itemDto.Quantity,
                        UnitPrice = itemDto.UnitPrice,
                        LineTotal = lineTotal
                    };

                    orderItems.Add(orderItem);
                    subtotal += lineTotal;
                }

                var discount = orderCreateDTO.Discount ?? 0;
                var total = subtotal + deliveryFee - discount;

                // Lấy delivery address từ DTO (bắt buộc phải nhập)
                string deliveryAddress = orderCreateDTO.DeliveryAddress 
                    // ?? customer.address  // Comment tạm - chờ update DB
                    ?? "No address provided";
                
                if (string.IsNullOrWhiteSpace(orderCreateDTO.DeliveryAddress))
                {
                    return BadRequest(new { message = "Delivery address is required" });
                }

                // Random select restaurant
                Restaurant? selectedRestaurant = null;
                try
                {
                    var activeRestaurants = await _context.Restaurants
                        .Where(r => r.IsActive == true)
                        .ToListAsync();
                    
                    if (activeRestaurants.Any())
                    {
                        var random = new Random();
                        selectedRestaurant = activeRestaurants[random.Next(activeRestaurants.Count)];
                        Console.WriteLine($"Selected restaurant: {selectedRestaurant.Name} (ID: {selectedRestaurant.RestaurantId})");
                    }
                    else
                    {
                        Console.WriteLine("No active restaurants found, using default ID 1");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error selecting restaurant: {ex.Message}");
                }

                // Tạo đơn hàng
                var order = new Order
                {
                    CustomerId = orderCreateDTO.CustomerId,
                    RestaurantId = selectedRestaurant?.RestaurantId ?? orderCreateDTO.RestaurantId, // Use random or fallback
                    DeliveryAddress = deliveryAddress,  // Lưu địa chỉ text
                    OrderAt = DateTime.Now,
                    Status = orderCreateDTO.PaymentMethod == "bank" ? "pending_payment" : "pending", // Phân biệt status
                    Subtotal = subtotal,
                    DeliveryFee = deliveryFee,
                    Discount = discount,
                    Total = total,
                    CouponCode = orderCreateDTO.CouponCode,
                    Notes = orderCreateDTO.Notes,
                    OrderItems = orderItems
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();
                
                // Tạo Payment record
                var payment = new Payment
                {
                    CustomerId = orderCreateDTO.CustomerId,
                    OrderId = order.OrderId,
                    Method = orderCreateDTO.PaymentMethod,
                    Amount = total,
                    Status = orderCreateDTO.PaymentMethod == "bank" ? "pending" : "completed", // COD = completed ngay
                    TransactionDate = DateTime.Now,
                    TxnRef = orderCreateDTO.PaymentMethod == "bank" ? $"SIPSWEET {order.OrderId}" : null
                };
                
                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                // Assign random driver and create delivery
                Delivery? delivery = null;
                Driver? assignedDriver = null;
                
                Console.WriteLine("Starting driver assignment...");
                
                try 
                {
                    // Get all drivers first to debug
                    var allDrivers = await _context.Drivers.ToListAsync();
                    Console.WriteLine($"Total drivers in DB: {allDrivers.Count}");
                    
                    // Get random available driver (status: Online or Available)
                    var availableDrivers = await _context.Drivers
                        .Where(d => d.Status == "Online" || d.Status == "Available")
                        .ToListAsync();
                    
                    Console.WriteLine($"Available drivers: {availableDrivers.Count}");
                    
                    if (availableDrivers.Any())
                    {
                        var random = new Random();
                        assignedDriver = availableDrivers[random.Next(availableDrivers.Count)];
                        
                        Console.WriteLine($"Selected driver: {assignedDriver.FullName} (ID: {assignedDriver.DriverId})");
                        
                        // Create delivery record
                        delivery = new Delivery
                        {
                            OrderId = order.OrderId,
                            DriverId = assignedDriver.DriverId,
                            PickupTime = DateTime.Now.AddMinutes(15),
                            DropoffTime = DateTime.Now.AddMinutes(45),
                            Status = "Pending",
                            Distance = 5.0m,
                            DriverFee = deliveryFee
                        };
                        
                        _context.Deliveries.Add(delivery);
                        await _context.SaveChangesAsync();
                        
                        Console.WriteLine($"Delivery record created! DeliveryID: {delivery.DeliveryId}");
                    }
                    else
                    {
                        Console.WriteLine("No available drivers found! Please insert drivers into database.");
                        // Log all drivers status
                        foreach (var d in allDrivers)
                        {
                            Console.WriteLine($"  - Driver {d.DriverId}: {d.FullName} - Status: '{d.Status}'");
                        }
                    }
                }
                catch (Exception driverEx)
                {
                    Console.WriteLine($"ERROR assigning driver: {driverEx.Message}");
                    Console.WriteLine($"Stack trace: {driverEx.StackTrace}");
                    if (driverEx.InnerException != null)
                    {
                        Console.WriteLine($"Inner exception: {driverEx.InnerException.Message}");
                    }
                    // Continue without failing the order
                }

                // Commit transaction
                await transaction.CommitAsync();

                var response = new OrderResponseDTO
                {
                    OrderId = order.OrderId,
                    CustomerId = order.CustomerId,
                    RestaurantId = order.RestaurantId,
                    DeliveryAddress = order.DeliveryAddress,
                    OrderAt = order.OrderAt,
                    Status = order.Status,
                    Subtotal = order.Subtotal,
                    DeliveryFee = order.DeliveryFee,
                    Discount = order.Discount,
                    Total = order.Total,
                    CouponCode = order.CouponCode,
                    Notes = order.Notes,
                    Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
                    {
                        OrderItemId = oi.OrderItemId,
                        ItemId = oi.ItemId,
                        ItemName = oi.Item?.name ?? "",
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        LineTotal = oi.LineTotal,
                        ImageUrl = oi.Item?.image_url
                    }).ToList(),
                    // Include driver info if assigned
                    Driver = assignedDriver != null ? new DriverInfoDTO
                    {
                        DriverId = assignedDriver.DriverId,
                        FullName = assignedDriver.FullName,
                        Phone = assignedDriver.Phone,
                        VehicleType = assignedDriver.VehicleType,
                        PlateNumber = assignedDriver.PlateNumber,
                        RatingAvg = assignedDriver.RatingAvg,
                        EstimatedPickupTime = delivery?.PickupTime,
                        EstimatedDeliveryTime = delivery?.DropoffTime
                    } : null,
                    // Include restaurant info
                    Restaurant = selectedRestaurant != null ? new RestaurantInfoDTO
                    {
                        RestaurantId = selectedRestaurant.RestaurantId,
                        Name = selectedRestaurant.Name,
                        CuisineType = selectedRestaurant.CuisineType,
                        Phone = selectedRestaurant.Phone,
                        Address = selectedRestaurant.Address,
                        RatingAvg = selectedRestaurant.RatingAvg
                    } : null
                };

                return CreatedAtAction(nameof(GetOrder), new { id = order.OrderId }, response);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                Console.WriteLine($"EXCEPTION in CreateOrder:");
                Console.WriteLine($"   Message: {ex.Message}");
                Console.WriteLine($"   StackTrace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"   InnerException: {ex.InnerException.Message}");
                }
                return StatusCode(500, new { message = "Error creating order", error = ex.Message });
            }
        }

        // GET: api/Order/{id} - Lấy đơn hàng theo ID
        [HttpGet("{id}")]
        public async Task<ActionResult<OrderResponseDTO>> GetOrder(long id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Item)
                .FirstOrDefaultAsync(o => o.OrderId == id);

            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            var response = new OrderResponseDTO
            {
                OrderId = order.OrderId,
                CustomerId = order.CustomerId,
                RestaurantId = order.RestaurantId,
                DeliveryAddress = order.DeliveryAddress,
                OrderAt = order.OrderAt,
                Status = order.Status,
                Subtotal = order.Subtotal,
                DeliveryFee = order.DeliveryFee,
                Discount = order.Discount,
                Total = order.Total,
                CouponCode = order.CouponCode,
                Notes = order.Notes,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
                {
                    OrderItemId = oi.OrderItemId,
                    ItemId = oi.ItemId,
                    ItemName = oi.Item?.name ?? "",
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    LineTotal = oi.LineTotal,
                    ImageUrl = oi.Item?.image_url
                }).ToList()
            };

            return Ok(response);
        }

        // GET: api/Order - Lấy danh sách đơn hàng với phân trang
        [HttpGet]
        public async Task<ActionResult<PaginatedOrdersDTO>> GetOrders(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10,
            [FromQuery] long? customerId = null,
            [FromQuery] string? status = null)
        {
            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 10;

            var query = _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Item)
                .AsQueryable();

            // Filter by customer
            if (customerId.HasValue)
            {
                query = query.Where(o => o.CustomerId == customerId.Value);
            }

            // Filter by status
            if (!string.IsNullOrEmpty(status))
            {
                query = query.Where(o => o.Status == status);
            }

            // Order by date descending
            query = query.OrderByDescending(o => o.OrderAt);

            var totalCount = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

            var orders = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new OrderResponseDTO
                {
                    OrderId = o.OrderId,
                    CustomerId = o.CustomerId,
                    RestaurantId = o.RestaurantId,
                    DeliveryAddress = o.DeliveryAddress,
                    OrderAt = o.OrderAt,
                    Status = o.Status,
                    Subtotal = o.Subtotal,
                    DeliveryFee = o.DeliveryFee,
                    Discount = o.Discount,
                    Total = o.Total,
                    CouponCode = o.CouponCode,
                    Notes = o.Notes,
                    Items = o.OrderItems.Select(oi => new OrderItemResponseDTO
                    {
                        OrderItemId = oi.OrderItemId,
                        ItemId = oi.ItemId,
                        ItemName = oi.Item != null ? oi.Item.name : "",
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        LineTotal = oi.LineTotal,
                        ImageUrl = oi.Item != null ? oi.Item.image_url : null
                    }).ToList()
                })
                .ToListAsync();

            var response = new PaginatedOrdersDTO
            {
                Orders = orders,
                CurrentPage = page,
                TotalPages = totalPages,
                TotalCount = totalCount,
                PageSize = pageSize,
                HasPrevious = page > 1,
                HasNext = page < totalPages
            };

            return Ok(response);
        }

        // PUT: api/Order/{id}/status - Cập nhật trạng thái đơn hàng
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateOrderStatus(long id, [FromBody] UpdateOrderStatusDTO updateDto)
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null)
            {
                return NotFound(new { message = "Order not found" });
            }

            order.Status = updateDto.Status;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Order status updated successfully", orderId = id, status = order.Status });
        }

        // GET: api/Order/stats - Thống kê đơn hàng
        [HttpGet("stats")]
        public async Task<ActionResult<OrderStatsDTO>> GetOrderStats()
        {
            var totalOrders = await _context.Orders.CountAsync();
            var pendingOrders = await _context.Orders.CountAsync(o => o.Status == "pending");
            var completedOrders = await _context.Orders.CountAsync(o => o.Status == "delivered");
            var cancelledOrders = await _context.Orders.CountAsync(o => o.Status == "cancelled");
            var totalRevenue = await _context.Orders
                .Where(o => o.Status == "delivered")
                .SumAsync(o => o.Total);

            var stats = new OrderStatsDTO
            {
                TotalOrders = totalOrders,
                PendingOrders = pendingOrders,
                CompletedOrders = completedOrders,
                CancelledOrders = cancelledOrders,
                TotalRevenue = totalRevenue
            };

            return Ok(stats);
        }
    }

    // DTO for updating order status
    public class UpdateOrderStatusDTO
    {
        public string Status { get; set; } = string.Empty;
    }
}