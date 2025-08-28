using System.Text;
using ApiTester.Api.Data;
using ApiTester.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApiTesterDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

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
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT key is not configured")))
        };
    });

builder.Services.AddControllers();
builder.Services.AddHttpClient();
builder.Services.AddSingleton<ApiRequestService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var port = Environment.GetEnvironmentVariable("PORT") ?? "7001";
builder.WebHost.UseUrls($"http://+:{port}");

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", policy =>
    {
        // In production
        if (builder.Environment.IsProduction())
        {
            policy.WithOrigins(
                    "https://api-tester.vercel.app",
                    "https://*.vercel.app"
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
        else
        {
            // Development - allow localhost
            policy.WithOrigins(
                    "http://localhost:4200",
                    "http://localhost:*"
                )
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAngular");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApiTesterDbContext>();
    dbContext.Database.EnsureCreated();
}

app.Run();