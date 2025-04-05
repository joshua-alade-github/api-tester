using System.ComponentModel.DataAnnotations;

namespace ApiTester.Api.Models
{
    public class ApiRequestModel
    {
        [Required(ErrorMessage = "URL is required")]
        public string? Url { get; set; }

        [Required]
        public string Method { get; set; } = "GET";

        public Dictionary<string, string> Headers { get; set; } = new Dictionary<string, string>();

        public string? RequestBody { get; set; }

        public string ContentType { get; set; } = "application/json";

        [Range(1, 300, ErrorMessage = "Timeout must be between 1 and 300 seconds")]
        public int TimeoutSeconds { get; set; } = 30;

        public string? AuthType { get; set; }

        public string? Username { get; set; }

        public string? Password { get; set; }

        public string? BearerToken { get; set; }

        public string? ApiKeyName { get; set; }

        public string? ApiKeyValue { get; set; }
    }
}