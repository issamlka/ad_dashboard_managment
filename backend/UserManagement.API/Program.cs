using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UserManagement.API.Data;
using UserManagement.API.Services;

var builder = WebApplication.CreateBuilder(args);

// ─── Phase 1: Configure Services ───────────────────────────────
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// CORS — allow React to talk to our API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// JWT Service
builder.Services.AddScoped<JwtService>();

// LDAP Service
builder.Services.AddScoped<LdapService>();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!))
    };
});

var app = builder.Build();

// ─── Phase 2: Middleware & Routes ──────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowReact");     // ← must be before UseAuthentication
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();