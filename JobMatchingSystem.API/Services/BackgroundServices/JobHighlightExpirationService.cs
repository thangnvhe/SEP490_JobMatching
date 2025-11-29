using JobMatchingSystem.API.Data;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.BackgroundServices
{
    public class JobHighlightExpirationService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<JobHighlightExpirationService> _logger;

        // Kiểm tra mỗi 5 phút 1 lần
        private readonly TimeSpan _checkInterval = TimeSpan.FromSeconds(30);

        public JobHighlightExpirationService(IServiceProvider serviceProvider,
            ILogger<JobHighlightExpirationService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("JobHighlightExpirationService đã khởi động - Kiểm tra Job hết hạn nổi bật mỗi {Interval} phút",
                _checkInterval.TotalMinutes);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessExpiredHighlightsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi nghiêm trọng trong JobHighlightExpirationService");
                }

                // Ngủ 5 phút rồi kiểm tra lại
                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("JobHighlightExpirationService đã dừng.");
        }

        private async Task ProcessExpiredHighlightsAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Tìm tất cả Job: IsHighlighted = true VÀ HighlightedUntil < Now
            var expiredJobs = await dbContext.Jobs
                .Where(j => j.IsHighlighted == true &&
                           j.HighlightedUntil != null &&
                           j.HighlightedUntil < DateTime.UtcNow &&
                           j.IsDeleted == false) // Không xử lý job đã xóa
                .Select(j => new { j.JobId, j.Title, j.HighlightedUntil })
                .ToListAsync(cancellationToken);

            if (!expiredJobs.Any())
            {
                // Không log mỗi 5 phút để tránh spam console
                return;
            }

            // Cập nhật tất cả Job expired
            var jobIds = expiredJobs.Select(j => j.JobId).ToList();
            var updatedCount = await dbContext.Jobs
                .Where(j => jobIds.Contains(j.JobId))
                .ExecuteUpdateAsync(s => s.SetProperty(j => j.IsHighlighted, false), cancellationToken);

            _logger.LogWarning("ĐÃ TỰ ĐỘNG TẮT nổi bật cho {Count} Job hết hạn: {JobIds}",
                updatedCount,
                string.Join(", ", expiredJobs.Take(5).Select(j => $"#{j.JobId} ({j.Title})")));

            if (expiredJobs.Count > 5)
            {
                _logger.LogWarning("... và {More} Job khác", expiredJobs.Count - 5);
            }
        }
    }
}
