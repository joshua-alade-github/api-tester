namespace ApiTester.Api.Models
{
    public class SavedRequestModel
    {
        public string? Id { get; set; }
        public string? UserId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public DateTime Created { get; set; }
        public ApiRequestModel? Request { get; set; }
    }
}