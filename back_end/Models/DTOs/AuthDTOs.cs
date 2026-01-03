using System.ComponentModel.DataAnnotations;

namespace SipSweet.Models.DTOs
{
    // Login Request
    public class LoginRequest
    {
        [Required]
        public string username { get; set; } = string.Empty;
        
        [Required]
        public string password { get; set; } = string.Empty;
    }

    // Login Response
    public class LoginResponse
    {
        public bool success { get; set; }
        public string message { get; set; } = string.Empty;
        public UserData? user { get; set; }
    }

    // User Data (for response)
    public class UserData
    {
        public long id { get; set; }
        public string username { get; set; } = string.Empty;
        public string full_name { get; set; } = string.Empty;
        public string email { get; set; } = string.Empty;
        public string? phone { get; set; }
        public string role { get; set; } = string.Empty; // "customer" hoặc "admin"
    }

    // Customer Signup Request
    public class CustomerSignupRequest
    {
        [Required]
        [StringLength(50)]
        public string username { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string password { get; set; } = string.Empty;

        [Required]
        public string full_name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string email { get; set; } = string.Empty;

        public string? phone { get; set; }

        public DateTime? DOB { get; set; }
        
        public string? gender { get; set; }
    }

    // Signup Response
    public class SignupResponse
    {
        public bool success { get; set; }
        public string message { get; set; } = string.Empty;
        public UserData? user { get; set; }
    }
}

