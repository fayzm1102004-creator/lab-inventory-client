using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using LabInventory.API.Data;
using LabInventory.API.Models;

var builder = WebApplication.CreateBuilder(args);

// ─── Database ────────────────────────────────────────────────────────
var connectionUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
string connectionString;

if (!string.IsNullOrEmpty(connectionUrl) && connectionUrl.StartsWith("postgres"))
{
    var databaseUri = new Uri(connectionUrl);
    var userInfo = databaseUri.UserInfo.Split(':');
    connectionString = $"Host={databaseUri.Host};Port={databaseUri.Port};Database={databaseUri.LocalPath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};Ssl Mode=Disable;";
}
else
{
    connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
                       ?? "Host=localhost;Database=LabInventory;Username=postgres;Password=postgres";
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// ─── JWT Authentication ──────────────────────────────────────────────
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization();

// ─── Controllers & CORS ─────────────────────────────────────────────
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// ─── Apply Migrations & Seed Admins on Startup ──────────────────────
try
{
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        db.Database.EnsureCreated();

        // Seed 4 Admin accounts if they don't already exist
        if (!db.Admins.Any())
        {
            var admins = new List<Admin>
            {
                new Admin { Username = "admin1", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123") },
                new Admin { Username = "admin2", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@456") },
                new Admin { Username = "admin3", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@789") },
                new Admin { Username = "admin4", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@012") },
            };
            db.Admins.AddRange(admins);
            db.SaveChanges();
            Console.WriteLine("✅ Seeded 4 Admin accounts.");
        }
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Database startup error: {ex.Message}");
}

// ─── Pipeline ────────────────────────────────────────────────────────
app.MapGet("/", () => "Lab Inventory API is running...");

app.UseCors("AllowReactApp");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
