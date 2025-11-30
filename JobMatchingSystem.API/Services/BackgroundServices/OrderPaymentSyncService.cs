using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Enums;
using JobMatchingSystem.API.Models;
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

                    // LẤY ServicePlan ĐỂ XỬ LÝ CÁC QUY TẮC
                    var servicePlan = await _dbContext.ServicePlans
                        .FirstOrDefaultAsync(sp => sp.Id == order.ServiceId, cancellationToken);

                    if (servicePlan != null)
                    {
                        var user = await _dbContext.Users
                            .Include(u => u.JobQuota)
                            .FirstOrDefaultAsync(u => u.Id == order.BuyerId, cancellationToken);

                        // 1. JobPostAdditional → cộng vào ExtraQuota
                        if (servicePlan.JobPostAdditional.HasValue)
                        {
                            if (user?.JobQuota != null)
                            {
                                user.JobQuota.ExtraQuota += servicePlan.JobPostAdditional.Value;
                            }
                        }

                        // 2. HighlightJobDays + HighlightJobDaysCount (CHỈ cộng nếu NGÀY GIỐNG NHAU)
                        if (servicePlan.HighlightJobDays.HasValue && servicePlan.HighlightJobDaysCount.HasValue)
                        {
                            var existingHighlight = await _dbContext.HighlightJobs
                                .FirstOrDefaultAsync(h => h.RecuiterId == order.BuyerId &&
                                                        h.HighlightJobDays == servicePlan.HighlightJobDays.Value,
                                                        cancellationToken);

                            if (existingHighlight != null)
                            {
                                // NGÀY GIỐNG NHAU → cộng dồn Count
                                existingHighlight.HighlightJobDaysCount += servicePlan.HighlightJobDaysCount.Value;
                            }
                            else
                            {
                                // NGÀY KHÁC NHAU → tạo mới
                                _dbContext.HighlightJobs.Add(new HighlightJob
                                {
                                    RecuiterId = order.BuyerId,
                                    HighlightJobDays = servicePlan.HighlightJobDays.Value,
                                    HighlightJobDaysCount = servicePlan.HighlightJobDaysCount.Value
                                });
                            }
                        }

                        // 3. ExtensionJobDays + ExtensionJobDaysCount (CHỈ cộng nếu NGÀY GIỐNG NHAU)
                        if (servicePlan.ExtensionJobDays.HasValue && servicePlan.ExtensionJobDaysCount.HasValue)
                        {
                            var existingExtension = await _dbContext.ExtensionJobs
                                .FirstOrDefaultAsync(e => e.RecuiterId == order.BuyerId &&
                                                        e.ExtensionJobDays == servicePlan.ExtensionJobDays.Value,
                                                        cancellationToken);

                            if (existingExtension != null)
                            {
                                // NGÀY GIỐNG NHAU → cộng dồn Count
                                existingExtension.ExtensionJobDaysCount += servicePlan.ExtensionJobDaysCount.Value;
                            }
                            else
                            {
                                // NGÀY KHÁC NHAU → tạo mới
                                _dbContext.ExtensionJobs.Add(new ExtensionJob
                                {
                                    RecuiterId = order.BuyerId,
                                    ExtensionJobDays = servicePlan.ExtensionJobDays.Value,
                                    ExtensionJobDaysCount = servicePlan.ExtensionJobDaysCount.Value
                                });
                            }
                        }

                        // 4. CVSaveAdditional → cộng vào SaveCVCount của User
                        if (servicePlan.CVSaveAdditional.HasValue)
                        {
                            user.SaveCVCount += servicePlan.CVSaveAdditional.Value;
                        }
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
