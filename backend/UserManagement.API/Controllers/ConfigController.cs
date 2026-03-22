using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace UserManagement.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ConfigController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ConfigController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public IActionResult GetConfig()
        {
            return Ok(new
            {
                domain = _configuration["LdapSettings:Domain"],
                server = _configuration["LdapSettings:Server"],
            });
        }
    }
}