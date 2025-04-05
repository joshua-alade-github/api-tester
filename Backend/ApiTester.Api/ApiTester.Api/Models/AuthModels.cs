using System.ComponentModel.DataAnnotations;

namespace ApiTester.Api.Models
{
    public class UserDto
    {
        public string? Id { get; set; }
        public string? Username { get; set; }
        public string? Email { get; set; }
    }

    public class RegisterRequest
    {
        [Required]
        public string? Username { get; set; }
        
        [Required, EmailAddress]
        public string? Email { get; set; }
        
        [Required, MinLength(6)]
        public string? Password { get; set; }
    }

    public class LoginRequest
    {
        [Required]
        public string? Username { get; set; }
        
        [Required]
        public string? Password { get; set; }
    }

    public class AuthResponse
    {
        public string? Token { get; set; }
        public UserDto? User { get; set; }
    }
}