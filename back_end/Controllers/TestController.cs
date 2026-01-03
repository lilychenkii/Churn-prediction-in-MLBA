using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SipSweet.Data;
using back_end.Models;

namespace back_end.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TestController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Test/restaurants
        [HttpGet("restaurants")]
        public async Task<ActionResult> GetRestaurants()
        {
            try
            {
                var allRestaurants = await _context.Restaurants.ToListAsync();
                var activeRestaurants = allRestaurants.Where(r => r.IsActive == true).ToList();
                
                return Ok(new
                {
                    success = true,
                    totalRestaurants = allRestaurants.Count,
                    activeRestaurants = activeRestaurants.Count,
                    restaurants = activeRestaurants.Select(r => new
                    {
                        id = r.RestaurantId,
                        name = r.Name,
                        cuisineType = r.CuisineType,
                        phone = r.Phone,
                        address = r.Address,
                        ratingAvg = r.RatingAvg,
                        isActive = r.IsActive
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // GET: api/Test/random-restaurant
        [HttpGet("random-restaurant")]
        public async Task<ActionResult> GetRandomRestaurant()
        {
            try
            {
                var activeRestaurants = await _context.Restaurants
                    .Where(r => r.IsActive == true)
                    .ToListAsync();
                
                if (!activeRestaurants.Any())
                {
                    return Ok(new
                    {
                        success = false,
                        message = "No active restaurants found"
                    });
                }
                
                var random = new Random();
                var selected = activeRestaurants[random.Next(activeRestaurants.Count)];
                
                return Ok(new
                {
                    success = true,
                    restaurant = new
                    {
                        id = selected.RestaurantId,
                        name = selected.Name,
                        cuisineType = selected.CuisineType,
                        phone = selected.Phone,
                        address = selected.Address,
                        ratingAvg = selected.RatingAvg
                    }
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    success = false,
                    error = ex.Message
                });
            }
        }
    }
}
