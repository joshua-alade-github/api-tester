using ApiTester.Api.Models;
using ApiTester.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ApiTester.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApiTesterController : ControllerBase
    {
        private readonly ApiRequestService _apiRequestService;

        public ApiTesterController(ApiRequestService apiRequestService)
        {
            _apiRequestService = apiRequestService;
        }

        [HttpPost("SendRequest")]
        public async Task<ActionResult<ApiResponseModel>> SendRequest(ApiRequestModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var response = await _apiRequestService.SendRequestAsync(model);
            return Ok(response);
        }
    }
}