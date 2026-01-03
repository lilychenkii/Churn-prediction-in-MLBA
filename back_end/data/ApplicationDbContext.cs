using Microsoft.EntityFrameworkCore;
using SipSweet.Models; 
using back_end.Models;

namespace SipSweet.Data 
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) {}
        
        // Product tables
        public DbSet<Item> Items { get; set; } = null!;
        
        // Authentication tables
        public DbSet<Customer> Customers { get; set; } = null!;
        public DbSet<Admin> Admins { get; set; } = null!;
        
        // Order tables
        public DbSet<Order> Orders { get; set; } = null!;
        public DbSet<OrderItem> OrderItems { get; set; } = null!;
        
        // Cart table
        public DbSet<CartItem> CartItems { get; set; } = null!;
        
        // Payment table
        public DbSet<Payment> Payments { get; set; } = null!;
        
        // Coupon table
        public DbSet<Coupon> Coupons { get; set; } = null!;
        
        // Delivery tables
        public DbSet<Driver> Drivers { get; set; } = null!;
        public DbSet<Delivery> Deliveries { get; set; } = null!;
        
        // Restaurant table
        public DbSet<Restaurant> Restaurants { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ✅ Configure table names to match MySQL
            modelBuilder.Entity<Item>().ToTable("item");
            modelBuilder.Entity<Customer>().ToTable("customer");
            modelBuilder.Entity<Admin>().ToTable("admin");
            modelBuilder.Entity<Order>().ToTable("order");
            modelBuilder.Entity<OrderItem>().ToTable("order_item");
            modelBuilder.Entity<CartItem>().ToTable("cart_item");
            modelBuilder.Entity<Payment>().ToTable("payment");
            modelBuilder.Entity<Coupon>().ToTable("coupon");
            modelBuilder.Entity<Driver>().ToTable("driver");
            modelBuilder.Entity<Delivery>().ToTable("delivery");
            modelBuilder.Entity<Restaurant>().ToTable("restaurant");

            // ✅ Configure CartItem relationships
            modelBuilder.Entity<CartItem>()
                .HasOne(c => c.customer)
                .WithMany()
                .HasForeignKey(c => c.customerid)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CartItem>()
                .HasOne(c => c.item)
                .WithMany()
                .HasForeignKey(c => c.itemid)
                .OnDelete(DeleteBehavior.Cascade);

            // ✅ Configure added_at default value
            modelBuilder.Entity<CartItem>()
                .Property(c => c.added_at)
                .HasDefaultValueSql("CURRENT_TIMESTAMP");
        }
    }
}