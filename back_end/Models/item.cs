using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SipSweet.Models 
{
    [Table("item")] 
    public class Item 
    {
        [Key]
        public long itemid { get; set; }
        
        public long restaurantid { get; set; }
        
        public long categoryid { get; set; }
        
        [Required]
        public string name { get; set; } = string.Empty;

        public string descriptionname { get; set; } = string.Empty;

        [Required]
        public decimal price { get; set; }
        
        public bool? available { get; set; }
        
        public decimal? rating_avg { get; set; }
        
        public int? rating_count { get; set; }
        
        public string? image_url { get; set; }
    }
}