using System.ComponentModel.DataAnnotations;

namespace back_end.Models.DTOs
{
    // DTO cho việc tạo đơn hàng
    public class OrderCreateDTO
    {
        [Required]
        public long CustomerId { get; set; }

        public long RestaurantId { get; set; } = 1; // Default restaurant

        public string? DeliveryAddress { get; set; } // Địa chỉ giao hàng (text)

        public decimal? Discount { get; set; } = 0;

        public string? CouponCode { get; set; }

        public string? Notes { get; set; }
        
        // Thêm payment method
        public string PaymentMethod { get; set; } = "cod"; // "cod" hoặc "bank"
        
        // Thêm delivery fee từ frontend
        public decimal? DeliveryFee { get; set; }

        [Required]
        public List<OrderItemCreateDTO> Items { get; set; } = new List<OrderItemCreateDTO>();
    }

    // DTO cho từng sản phẩm trong đơn hàng
    public class OrderItemCreateDTO
    {
        [Required]
        public long ItemId { get; set; }

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Quantity must be at least 1")]
        public int Quantity { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Unit price must be greater than 0")]
        public decimal UnitPrice { get; set; }
    }

    // DTO cho response sau khi tạo đơn hàng
    public class OrderResponseDTO
    {
        public long OrderId { get; set; }
        public long CustomerId { get; set; }
        public long RestaurantId { get; set; }
        public string? DeliveryAddress { get; set; }
        public DateTime? OrderAt { get; set; }
        public string? Status { get; set; }
        public decimal? Subtotal { get; set; }
        public decimal? DeliveryFee { get; set; }
        public decimal? Discount { get; set; }
        public decimal Total { get; set; }
        public string? CouponCode { get; set; }
        public string? Notes { get; set; }
        public List<OrderItemResponseDTO> Items { get; set; } = new List<OrderItemResponseDTO>();
        public DriverInfoDTO? Driver { get; set; } // Thông tin shipper
        public RestaurantInfoDTO? Restaurant { get; set; } // Thông tin nhà hàng
    }

    // DTO cho từng sản phẩm trong response
    public class OrderItemResponseDTO
    {
        public long OrderItemId { get; set; }
        public long ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int? Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal? LineTotal { get; set; }
        public string? ImageUrl { get; set; }
    }

    // DTO cho phân trang
    public class PaginatedOrdersDTO
    {
        public List<OrderResponseDTO> Orders { get; set; } = new List<OrderResponseDTO>();
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public bool HasPrevious { get; set; }
        public bool HasNext { get; set; }
    }

    // DTO cho thống kê đơn hàng
    public class OrderStatsDTO
    {
        public int TotalOrders { get; set; }
        public int PendingOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int CancelledOrders { get; set; }
        public decimal TotalRevenue { get; set; }
    }
    
    // DTO cho thông tin driver
    public class DriverInfoDTO
    {
        public long DriverId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? VehicleType { get; set; }
        public string? PlateNumber { get; set; }
        public decimal? RatingAvg { get; set; }
        public DateTime? EstimatedPickupTime { get; set; }
        public DateTime? EstimatedDeliveryTime { get; set; }
    }
    
    // DTO cho thông tin restaurant
    public class RestaurantInfoDTO
    {
        public long RestaurantId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? CuisineType { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }
        public decimal? RatingAvg { get; set; }
    }
}