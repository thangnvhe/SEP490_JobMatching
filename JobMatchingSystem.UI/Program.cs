using JobMatchingSystem.DataAccess.Configuration;
using JobMatchingSystem.DataAccess.Data.SeedData;
using JobMatchingSystem.Infrastructure.Configuration;

var builder = WebApplication.CreateBuilder(args);
builder.Services.ConfigureIdentity(builder.Configuration);
builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews();
var app = builder.Build();
await app.AutoMigration();
await app.SeedAdminUserAsync();
await app.SeedAllData();
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
