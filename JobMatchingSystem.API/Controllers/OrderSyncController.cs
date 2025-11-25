using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderSyncController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public OrderSyncController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("sync-transactions")]
        public async Task<IActionResult> SyncOrdersWithTransactions()
        {
            // 1. Lấy danh sách order có status = pending
            var pendingOrders = await _dbContext.Orders
                .Where(o => o.Status == OrderStatus.Pending)
                .ToListAsync();

            if (!pendingOrders.Any())
                return Ok("Không có order nào cần xử lý.");

            // 2. Lấy tất cả giao dịch SePay đã sync
            var transactions = await _dbContext.BankTransactionHistorys.ToListAsync();

            // 3. Đếm số order được update để trả về
            int updatedCount = 0;

            // 4. So khớp order vs transaction
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

                    // Cập nhật JobQuota nếu có
                    var jobQuota = await _dbContext.JobQuotas
                        .FirstOrDefaultAsync(jq => jq.RecruiterId == order.BuyerId);

                    if (jobQuota != null)
                    {
                        jobQuota.ExtraQuota += 2;
                    }
                }
            }

            // 5. Lưu thay đổi vào DB
            await _dbContext.SaveChangesAsync();

            return Ok($"Đã cập nhật {updatedCount} order thành 'done'.");
        }
    }
}
