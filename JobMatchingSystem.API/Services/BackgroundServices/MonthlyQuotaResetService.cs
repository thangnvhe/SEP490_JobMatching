using JobMatchingSystem.API.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.BackgroundServices
{
    public class MonthlyQuotaResetService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<MonthlyQuotaResetService> _logger;

        public MonthlyQuotaResetService(IServiceProvider serviceProvider, ILogger<MonthlyQuotaResetService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                // Tính thời gian chờ đến 0h00 ngày mùng 1 tháng sau
                var now = DateTime.Now;
                var nextFirstDay = new DateTime(now.Year, now.Month, 1).AddMonths(1); // Ngày 1 tháng sau
                var targetTime = nextFirstDay.Date; // 0h00 ngày mùng 1 tháng sau

                var delay = targetTime - now;
                if (delay < TimeSpan.Zero)
                    delay = TimeSpan.Zero; // Trường hợp đang là sau 0h ngày mùng 1 (hiếm)

                _logger.LogInformation("MonthlyQuotaResetService sẽ chạy vào: {TargetTime} (chờ {Delay})",
                    targetTime.ToString("dd/MM/yyyy HH:mm:ss"), delay.ToString(@"d\d\ h\h\ m\m\ s\s"));

                // Chờ đến đúng thời điểm
                await Task.Delay(delay, stoppingToken);

                // Kiểm tra lại lần cuối có bị cancel không
                if (stoppingToken.IsCancellationRequested) break;

                await ResetAllMonthlyQuotaAsync();
            }
        }

        private async Task ResetAllMonthlyQuotaAsync()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                // Cách 1: Dùng raw SQL - nhanh nhất (khuyên dùng)
                var affectedRows = await dbContext.Database
                    .ExecuteSqlRawAsync("UPDATE JobQuotas SET MonthlyQuota = 5");

                // Nếu muốn ghi log chi tiết hơn:
                // var quotas = await dbContext.JobQuotas.ToListAsync();
                // foreach (var q in quotas) q.MonthlyQuota = 5;
                // await dbContext.SaveChangesAsync();

                _logger.LogInformation("ĐÃ RESET THÀNH CÔNG MonthlyQuota = 5 cho {Count} nhà tuyển dụng vào {Now}",
                    affectedRows, DateTime.Now.ToString("dd/MM/yyyy HH:mm:ss"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "LỖI khi reset MonthlyQuota vào ngày mùng 1");
            }
        }
    }
}
