using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.BackgroundServices
{
    public class OrderTimeoutService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OrderTimeoutService> _logger;

        // Thời gian chờ trước khi coi là timeout (mặc định 5 phút)
        private readonly TimeSpan _timeoutDuration = TimeSpan.FromMinutes(5);

        // Thời gian kiểm tra định kỳ (mỗi 30 giây kiểm tra 1 lần)
        private readonly TimeSpan _checkInterval = TimeSpan.FromSeconds(30);

        public OrderTimeoutService(IServiceProvider serviceProvider, ILogger<OrderTimeoutService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("OrderTimeoutService đã khởi động. Sẽ kiểm tra đơn hàng Pending quá 5 phút mỗi {Interval}s",
                _checkInterval.TotalSeconds);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessPendingOrdersAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi nghiêm trọng trong OrderTimeoutService");
                }

                // Chờ đến lần kiểm tra tiếp theo
                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("OrderTimeoutService đã dừng.");
        }

        private async Task ProcessPendingOrdersAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Thời điểm cutoff: 5 phút trước 
            var cutoffTime = DateTime.UtcNow.Subtract(_timeoutDuration);

            // Lấy tất cả order Pending + CreatedAt < cutoffTime
            var timeoutOrders = await dbContext.Orders
                .Where(o => o.Status == OrderStatus.Pending && o.CreatedAt < cutoffTime)
                .ToListAsync(cancellationToken);

            if (!timeoutOrders.Any())
                return;

            foreach (var order in timeoutOrders)
            {
                order.Status = OrderStatus.Failed;
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            _logger.LogWarning("ĐÃ TỰ ĐỘNG CHUYỂN {Count} đơn hàng từ Pending → Failed (quá {Minutes} phút)",
                timeoutOrders.Count,
                _timeoutDuration.TotalMinutes);
        }
    }
}
