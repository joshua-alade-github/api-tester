using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ApiTester.Api.Data;
using ApiTester.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace ApiTester.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SavedRequestsController : ControllerBase
    {
        private readonly ApiTesterDbContext _context;

        public SavedRequestsController(ApiTesterDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SavedRequestModel>>> GetSavedRequests()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var requests = await _context.SavedRequests
                .Where(r => r.UserId == userId)
                .Select(r => new SavedRequestModel
                {
                    Id = r.Id,
                    UserId = r.UserId,
                    Name = r.Name,
                    Description = r.Description,
                    Created = r.Created,
                    Request = JsonConvert.DeserializeObject<ApiRequestModel>(r.RequestJson ?? "{}")
                })
                .ToListAsync();

            return Ok(requests);
        }

        [HttpPost]
        public async Task<ActionResult<SavedRequestModel>> SaveRequest(SavedRequestModel model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            var savedRequest = new SavedRequest
            {
                UserId = userId,
                Name = model.Name,
                Description = model.Description,
                Created = DateTime.UtcNow,
                RequestJson = JsonConvert.SerializeObject(model.Request)
            };

            _context.SavedRequests.Add(savedRequest);
            await _context.SaveChangesAsync();

            model.Id = savedRequest.Id;
            model.Created = savedRequest.Created;
            
            return CreatedAtAction(nameof(GetSavedRequest), new { id = savedRequest.Id }, model);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SavedRequestModel>> GetSavedRequest(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var savedRequest = await _context.SavedRequests.FindAsync(id);

            if (savedRequest == null || savedRequest.UserId != userId)
                return NotFound();

            return new SavedRequestModel
            {
                Id = savedRequest.Id,
                UserId = savedRequest.UserId,
                Name = savedRequest.Name,
                Description = savedRequest.Description,
                Created = savedRequest.Created,
                Request = JsonConvert.DeserializeObject<ApiRequestModel>(savedRequest.RequestJson ?? "{}")
            };
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSavedRequest(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var savedRequest = await _context.SavedRequests.FindAsync(id);

            if (savedRequest == null || savedRequest.UserId != userId)
                return NotFound();

            _context.SavedRequests.Remove(savedRequest);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}