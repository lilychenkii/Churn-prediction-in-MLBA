using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace back_end.Models
{
    [Table("restaurant")]
    public class Restaurant
    {
        [Key]
        [Column("restaurantid")]
        public long RestaurantId { get; set; }

        [Required]
        [Column("name")]
        [StringLength(255)]
        public string Name { get; set; } = string.Empty;

        [Column("cuisine_type")]
        [StringLength(100)]
        public string? CuisineType { get; set; }

        [Column("phone")]
        [StringLength(20)]
        public string? Phone { get; set; }

        [Column("address")]
        [StringLength(500)]
        public string? Address { get; set; }

        [Column("lat")]
        public decimal? Lat { get; set; }

        [Column("lng")]
        public decimal? Lng { get; set; }

        [Column("open_time")]
        public TimeSpan? OpenTime { get; set; }

        [Column("close_time")]
        public TimeSpan? CloseTime { get; set; }

        [Column("rating_avg")]
        public decimal? RatingAvg { get; set; }

        [Column("rating_count")]
        public int? RatingCount { get; set; }  // 

        [Column("is_active")]
        public bool? IsActive { get; set; }
    }
}
