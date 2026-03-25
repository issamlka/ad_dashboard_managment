using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using UserManagement.API.Models;

namespace UserManagement.API.Services
{
    public class JwtService
    {
        private readonly IConfiguration _configuration;

        public JwtService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

       public string GenerateToken(User user, UserPermission? permission = null)
{
    var secretKey = _configuration["JwtSettings:SecretKey"];
    var issuer = _configuration["JwtSettings:Issuer"];
    var audience = _configuration["JwtSettings:Audience"];
    var expirationInMinutes = int.Parse(_configuration["JwtSettings:ExpirationInMinutes"]!);

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
    var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Role, user.Role),
        new Claim(ClaimTypes.Email, user.Email),
        // ← Add permission claims
        new Claim("CanCreateAdUsers", (permission?.CanCreateAdUsers ?? false).ToString()),
        new Claim("CanDisableEnableAdUsers", (permission?.CanDisableEnableAdUsers ?? false).ToString()),
        // new Claim("CanCreateDbUsers", (permission?.CanCreateDbUsers ?? false).ToString()),
        // new Claim("CanEditDbUsers", (permission?.CanEditDbUsers ?? false).ToString()),
        // new Claim("CanDeleteDbUsers", (permission?.CanDeleteDbUsers ?? false).ToString()),
    };

    var token = new JwtSecurityToken(
        issuer: issuer,
        audience: audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(expirationInMinutes),
        signingCredentials: credentials
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}
    }
}