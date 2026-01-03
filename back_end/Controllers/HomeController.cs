using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SipSweet.Data; 
using SipSweet.Models;

namespace SipSweet.Controllers
{
    public class HomeController : Controller
    {
        private readonly ApplicationDbContext _context;

        public HomeController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Index()
        {
            // Sửa lại để lấy dữ liệu từ _context.Items
            var allItems = await _context.Items.ToListAsync();
            return View(allItems);
        }
    }
}
