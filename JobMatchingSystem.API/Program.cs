using JobMatchingSystem.API.Configuration;
using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Data.SeedData;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Mappings;
using JobMatchingSystem.API.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
// Đăng ký các dịch vụ IExceptionHandler
builder.Services.AddExceptionHandler<ValidationResponseExceptionHandler>(); // Đăng ký Validation Handler trước
builder.Services.AddExceptionHandler<GlobalResponseExceptionHandler>();      // Đăng ký Global Handler sau
// Thêm dịch vụ hỗ trợ IExceptionHandler
builder.Services.AddProblemDetails();
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient();

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendCors", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://14.225.19.47:5173"
            ) // URL frontend của bạn
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
// Swagger được cấu hình trong ConfigurationService.ConfigureIdentity()
builder.Services.ConfigureIdentity(builder.Configuration);
builder.Services.AddRepositories();
builder.Services.AddServices();
builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile(new MappingProfile());
});
builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection("EmailSettings"));

var app = builder.Build();

// 1) Migration + Seed trước khi vào pipeline
await app.AutoMigration();
await app.SeedAdminUserAsync();
await app.SeedAllData();
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    // Nếu bảng SystemConfigs chưa có dữ liệu
    if (!await context.SystemConfigs.AnyAsync())
    {
        context.SystemConfigs.Add(new SystemConfig
        {
            // ===== BASIC CONFIG =====
            JobQuota = 5,
            SaveCV = 100,

            // ===== COMPANY PENALTY =====
            CompanyFraudulentPenalty = 15,
            CompanySpamPenalty = 5,
            CompanyInappropriatePenalty = 8,
            CompanyOtherPenalty = 6,

            // ===== REPORTER PENALTY =====
            ReporterFraudulentPenalty = 8,
            ReporterSpamPenalty = 3,
            ReporterInappropriatePenalty = 5,
            ReporterOtherPenalty = 4
        });

        await context.SaveChangesAsync();
    }
}


app.UseExceptionHandler();

// 3) Swagger
app.UseSwagger();
app.UseSwaggerUI();

// Nếu dùng HTTPS
// app.UseHttpsRedirection();

// 4) CORS phải đặt trước Auth
app.UseCors("FrontendCors");

// 5) Static files (nếu có upload)
app.UseStaticFiles();

// 6) Auth
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
  