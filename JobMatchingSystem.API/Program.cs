using JobMatchingSystem.API.Configuration;
using JobMatchingSystem.API.Data.SeedData;
using JobMatchingSystem.API.DTOs;
using JobMatchingSystem.API.Exceptions;
using JobMatchingSystem.API.Helpers;
using JobMatchingSystem.API.Mappings;

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
        policy.WithOrigins("http://localhost:5173") // URL frontend của bạn
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Quan trọng: cho phép gửi cookie/token
    });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
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
await app.AutoMigration();
await app.SeedAdminUserAsync();
await app.SeedAllData();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("FrontendCors");
app.UseAuthentication();
app.UseAuthorization();
app.UseExceptionHandler();

app.MapControllers();

app.Run();
  