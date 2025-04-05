namespace ApiTester.Api.Models
{
    public class ApiResponseModel
    {
        public int StatusCode { get; set; }
        public Dictionary<string, string> Headers { get; set; } = new Dictionary<string, string>();
        public string? ContentType { get; set; }
        public string? Body { get; set; }
        public string? FormattedBody { get; set; }
        public bool IsValidJson { get; set; }
        public long ResponseTimeMs { get; set; }
        public string? Error { get; set; }
    }
}