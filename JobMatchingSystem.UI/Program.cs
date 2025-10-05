using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using JobMatchingSystem.Infrastructure.IServices;
using JobMatchingSystem.Infrastructure.Services;
using JobMatchingSystem.Infrastructure.Configuration;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();

// Configure AI Settings
builder.Services.Configure<AISettings>(builder.Configuration.GetSection("AISettings"));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

// Register HttpClient
builder.Services.AddHttpClient();

// Register custom services
builder.Services.AddScoped<IAIService, AIService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IImageService, ImageService>();
builder.Services.AddScoped<IPDFService, PDFService>();
var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{area=Public}/{controller=Home}/{action=Index}/{id?}");
app.MapRazorPages();

app.Run();
