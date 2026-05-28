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

if (connectionString.Contains("Server=", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connectionString));
}
else
{
    builder.Services.AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(connectionString));
}

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

        // Seed 15 Materials if the table is empty
        if (!db.Materials.Any())
        {
            var materials = new List<Material>
            {
                // ── Available Materials ──────────────────────────────────
                new Material
                {
                    MaterialName     = "Sulfuric Acid (H₂SO₄)",
                    PhysicalLocation = "دولاب: A - رف: 2",
                    Quantity         = 12,
                    IsAvailable      = true
                },
                new Material
                {
                    MaterialName     = "Sodium Chloride (NaCl)",
                    PhysicalLocation = "دولاب: A - رف: 3",
                    Quantity         = 30,
                    IsAvailable      = true
                },
                new Material
                {
                    MaterialName     = "Ethanol (C₂H₅OH)",
                    PhysicalLocation = "دولاب: B - رف: 1",
                    Quantity         = 8,
                    IsAvailable      = true
                },
                new Material
                {
                    MaterialName     = "Hydrochloric Acid (HCl)",
                    PhysicalLocation = "دولاب: A - رف: 1",
                    Quantity         = 10,
                    IsAvailable      = true
                },
                new Material
                {
                    MaterialName     = "Magnesium Ribbon (Mg)",
                    PhysicalLocation = "دولاب: C - رف: 4",
                    Quantity         = 25,
                    IsAvailable      = true
                },
                new Material
                {
                    MaterialName     = "Copper Sulfate (CuSO₄)",
                    PhysicalLocation = "دولاب: B - رف: 3",
                    Quantity         = 15,
                    IsAvailable      = true
                },
                new Material
                {
                    MaterialName     = "Zinc Powder (Zn)",
                    PhysicalLocation = "دولاب: C - رف: 2",
                    Quantity         = 5,
                    IsAvailable      = true
                },
                new Material
                {
                    MaterialName     = "Calcium Carbonate (CaCO₃)",
                    PhysicalLocation = "دولاب: A - رف: 4",
                    Quantity         = 20,
                    IsAvailable      = true
                },
                new Material
                {
                    MaterialName     = "Phenolphthalein Indicator",
                    PhysicalLocation = "دولاب: D - رف: 1",
                    Quantity         = 6,
                    IsAvailable      = true
                },
                new Material
                {
                    MaterialName     = "Litmus Paper (Red & Blue)",
                    PhysicalLocation = "دولاب: D - رف: 2",
                    Quantity         = 50,
                    IsAvailable      = true
                },
                new Material
                {
                    MaterialName     = "Potassium Permanganate (KMnO₄)",
                    PhysicalLocation = "دولاب: B - رف: 2",
                    Quantity         = 7,
                    IsAvailable      = true
                },
                new Material
                {
                    MaterialName     = "Iron Filings (Fe)",
                    PhysicalLocation = "دولاب: C - رف: 1",
                    Quantity         = 18,
                    IsAvailable      = true
                },

                // ── Unavailable / Out-of-Stock Materials ─────────────────
                new Material
                {
                    MaterialName     = "Silver Nitrate (AgNO₃)",
                    PhysicalLocation = "دولاب: D - رف: 3",
                    Quantity         = 0,
                    IsAvailable      = false
                },
                new Material
                {
                    MaterialName     = "Methanol (CH₃OH)",
                    PhysicalLocation = "دولاب: B - رف: 4",
                    Quantity         = 0,
                    IsAvailable      = false
                },
                new Material
                {
                    MaterialName     = "Barium Chloride (BaCl₂)",
                    PhysicalLocation = "دولاب: A - رف: 5",
                    Quantity         = 0,
                    IsAvailable      = false
                },
            };

            db.Materials.AddRange(materials);
            db.SaveChanges();
            Console.WriteLine("✅ Seeded 15 Material records.");
        }

        // Seed 7 AuditLog entries if the table is empty
        if (!db.AuditLogs.Any())
        {
            var now = DateTime.UtcNow;

            var auditLogs = new List<AuditLog>
            {
                new AuditLog
                {
                    UserName       = "Ahmed Hassan",
                    LoginTime      = now.AddDays(-3).AddHours(-2),
                    LogoutTime     = now.AddDays(-3).AddHours(-2).AddMinutes(18),
                    SearchKeywords = "Sulfuric, Acid, H2SO4"
                },
                new AuditLog
                {
                    UserName       = "Sarah Ali",
                    LoginTime      = now.AddDays(-2).AddHours(-5),
                    LogoutTime     = now.AddDays(-2).AddHours(-5).AddMinutes(12),
                    SearchKeywords = "Sodium Chloride, NaCl"
                },
                new AuditLog
                {
                    UserName       = "Omar Tarek",
                    LoginTime      = now.AddDays(-2).AddHours(-1),
                    LogoutTime     = now.AddDays(-2).AddHours(-1).AddMinutes(25),
                    SearchKeywords = "Ethanol, Alcohol"
                },
                new AuditLog
                {
                    UserName       = "Mona Khalil",
                    LoginTime      = now.AddDays(-1).AddHours(-8),
                    LogoutTime     = now.AddDays(-1).AddHours(-8).AddMinutes(7),
                    SearchKeywords = "Magnesium, Ribbon"
                },
                new AuditLog
                {
                    UserName       = "Youssef Nabil",
                    LoginTime      = now.AddDays(-1).AddHours(-3),
                    LogoutTime     = now.AddDays(-1).AddHours(-3).AddMinutes(30),
                    SearchKeywords = "Copper Sulfate, Zinc, Indicator"
                },
                new AuditLog
                {
                    UserName       = "Layla Mostafa",
                    LoginTime      = now.AddHours(-6),
                    LogoutTime     = now.AddHours(-6).AddMinutes(15),
                    SearchKeywords = "Litmus, Phenolphthalein"
                },
                new AuditLog
                {
                    UserName       = "Khaled Adel",
                    LoginTime      = now.AddHours(-1),
                    LogoutTime     = null,           // still active
                    SearchKeywords = "Potassium, Permanganate, Iron"
                },
            };

            db.AuditLogs.AddRange(auditLogs);
            db.SaveChanges();
            Console.WriteLine("✅ Seeded 7 AuditLog records.");
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
