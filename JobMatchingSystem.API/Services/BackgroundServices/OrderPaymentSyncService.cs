using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Enums;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Services.BackgroundServices
{
    public class OrderPaymentSyncService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OrderPaymentSyncService> _logger;

        public OrderPaymentSyncService(IServiceProvider serviceProvider, ILogger<OrderPaymentSyncService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("OrderPaymentSyncService đã khởi động - Kiểm tra thanh toán mỗi 10 giây");

            // Chạy ngay lần đầu khi khởi động (tùy chọn, rất tiện để test)
            await Task.Delay(2000, stoppingToken); // Chờ DB sẵn sàng
            await SyncOrdersWithTransactionsAsync(stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await SyncOrdersWithTransactionsAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Lỗi nghiêm trọng trong OrderPaymentSyncService");
                }

                // Ngủ 10 giây rồi chạy lại
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);
            }

            _logger.LogInformation("OrderPaymentSyncService đã dừng.");
        }

        private async Task SyncOrdersWithTransactionsAsync(CancellationToken cancellationToken)
        {
            using var scope = _serviceProvider.CreateScope();
            var _dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // 1. Lấy danh sách order có status = Pending
            var pendingOrders = await _dbContext.Orders
                .Where(o => o.Status == OrderStatus.Pending)
                .ToListAsync(cancellationToken);

            if (!pendingOrders.Any())
            {
                // Không có gì để xử lý → im lặng (không log mỗi 10s để tránh spam)
                return;
            }

            _logger.LogInformation("Đang kiểm tra thanh toán cho {Count} order Pending...", pendingOrders.Count);

            // 2. Lấy tất cả giao dịch SePay đã sync
            var transactions = await _dbContext.BankTransactionHistorys
                .ToListAsync(cancellationToken);

            if (!transactions.Any())
                return;

            // 3. Đếm số order được update
            int updatedCount = 0;

            // 4. So khớp order vs transaction (giữ nguyên 100% logic cũ)
            foreach (var order in pendingOrders)
            {
                var match = transactions.FirstOrDefault(t =>
                    t.AmountIn == order.Amount &&
                    t.TransactionContent != null &&
                    t.TransactionContent.Trim().Equals(order.TransferContent.Trim(), StringComparison.OrdinalIgnoreCase)
                );

                if (match != null)
                {
                    order.Status = OrderStatus.Success;
                    updatedCount++;

                    // Cập nhật JobQuota nếu có (giữ nguyên logic cũ)
                    var jobQuota = await _dbContext.JobQuotas
                        .FirstOrDefaultAsync(jq => jq.RecruiterId == order.BuyerId, cancellationToken);

                    if (jobQuota != null)
                    {
                        jobQuota.ExtraQuota += 2;
                    }
                }
            }

            // 5. Lưu thay đổi vào DB (chỉ lưu 1 lần)
            if (updatedCount > 0)
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
                _logger.LogWarning("ĐÃ TỰ ĐỘNG CẬP NHẬT {Count} order thành Success và cộng +2 ExtraQuota!", updatedCount);
            }
        }
    }
}
