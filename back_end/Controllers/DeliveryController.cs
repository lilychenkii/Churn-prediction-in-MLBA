using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SipSweet.Data;
using back_end.Models;

namespace back_end.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DeliveryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DeliveryController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Delivery/assign-random-driver
        [HttpGet("assign-random-driver")]
        public async Task<ActionResult<object>> GetRandomDriver()
        {
            try
            {
                // Get all available drivers
                var availableDrivers = await _context.Drivers
                    .Where(d => d.Status == "Available")
                    .ToListAsync();

                if (!availableDrivers.Any())
                {
                    return NotFound(new { message = "No available drivers at the moment" });
                }

                // Random select one driver
                var random = new Random();
                var randomDriver = availableDrivers[random.Next(availableDrivers.Count)];

                return Ok(new
                {
                    driverId = randomDriver.DriverId,
                    fullName = randomDriver.FullName,
                    phone = randomDriver.Phone,
                    vehicleType = randomDriver.VehicleType,
                    plateNumber = randomDriver.PlateNumber,
                    ratingAvg = randomDriver.RatingAvg
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error assigning driver", error = ex.Message });
            }
        }

        // POST: api/Delivery/create
        [HttpPost("create")]
        public async Task<ActionResult<Delivery>> CreateDelivery([FromBody] CreateDeliveryRequest request)
        {
            try
            {
                // Validate order exists
                var orderExists = await _context.Orders.AnyAsync(o => o.OrderId == request.OrderId);
                if (!orderExists)
                {
                    return NotFound(new { message = "Order not found" });
                }

                // Validate driver exists
                var driverExists = await _context.Drivers.AnyAsync(d => d.DriverId == request.DriverId);
                if (!driverExists)
                {
                    return NotFound(new { message = "Driver not found" });
                }

                // Create delivery record
                var delivery = new Delivery
                {
                    OrderId = request.OrderId,
                    DriverId = request.DriverId,
                    PickupTime = DateTime.Now.AddMinutes(15), // Estimated pickup in 15 mins
                    DropoffTime = DateTime.Now.AddMinutes(45), // Estimated delivery in 45 mins
                    Status = "Pending",
                    Distance = request.Distance ?? 5.0m, // Default 5km if not provided
                    DriverFee = request.DriverFee ?? 30000m // Default shipping fee
                };

                _context.Deliveries.Add(delivery);
                await _context.SaveChangesAsync();

                // Get driver details
                var driver = await _context.Drivers.FindAsync(request.DriverId);

                return Ok(new
                {
                    deliveryId = delivery.DeliveryId,
                    orderId = delivery.OrderId,
                    driver = new
                    {
                        driverId = driver?.DriverId,
                        fullName = driver?.FullName,
                        phone = driver?.Phone,
                        vehicleType = driver?.VehicleType,
                        plateNumber = driver?.PlateNumber,
                        ratingAvg = driver?.RatingAvg
                    },
                    pickupTime = delivery.PickupTime,
                    dropoffTime = delivery.DropoffTime,
                    status = delivery.Status
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating delivery", error = ex.Message });
            }
        }

        // GET: api/Delivery/order/{orderId}
        [HttpGet("order/{orderId}")]
        public async Task<ActionResult<object>> GetDeliveryByOrderId(long orderId)
        {
            try
            {
                var delivery = await _context.Deliveries
                    .Include(d => d.Driver)
                    .FirstOrDefaultAsync(d => d.OrderId == orderId);

                if (delivery == null)
                {
                    return NotFound(new { message = "Delivery not found for this order" });
                }

                return Ok(new
                {
                    deliveryId = delivery.DeliveryId,
                    orderId = delivery.OrderId,
                    driver = new
                    {
                        driverId = delivery.Driver?.DriverId,
                        fullName = delivery.Driver?.FullName,
                        phone = delivery.Driver?.Phone,
                        vehicleType = delivery.Driver?.VehicleType,
                        plateNumber = delivery.Driver?.PlateNumber,
                        ratingAvg = delivery.Driver?.RatingAvg
                    },
                    pickupTime = delivery.PickupTime,
                    dropoffTime = delivery.DropoffTime,
                    status = delivery.Status
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error getting delivery info", error = ex.Message });
            }
        }
    }

    // DTO for creating delivery
    public class CreateDeliveryRequest
    {
        public long OrderId { get; set; }
        public long DriverId { get; set; }
        public decimal? Distance { get; set; }
        public decimal? DriverFee { get; set; }
    }
}
