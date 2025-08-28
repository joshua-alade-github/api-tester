using Microsoft.AspNetCore.Mvc;

namespace ApiTester.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { 
                status = "healthy", 
                service = "API Tester Backend",
                timestamp = DateTime.UtcNow 
            });
        }
    }
}