using JobMatchingSystem.API.Data;
using JobMatchingSystem.API.Models;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using System.Text.Json;

namespace JobMatchingSystem.API.Services.BackgroundServices
{
    public class SePaySyncService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly ILogger<SePaySyncService> _logger;

        public SePaySyncService(IServiceProvider serviceProvider,
            IConfiguration config,
            HttpClient httpClient,
            ILogger<SePaySyncService> logger)
        {
            _serviceProvider = serviceProvider;
            _config = config;
            _httpClient = httpClient;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            // Chạy ngay lần đầu khi khởi động
            while (!stoppingToken.IsCancellationRequested)
            {
                await SyncTransactionsAsync();
                await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken); // Chạy lại sau mỗi 10 giây
            }
        }

        private async Task SyncTransactionsAsync()
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var _dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

                // 1. Lấy giao dịch mới nhất trong DB
                var lastTransactionDate = await _dbContext.BankTransactionHistorys
                    .OrderByDescending(t => t.TransactionDate)
                    .Select(t => t.TransactionDate)
                    .FirstOrDefaultAsync();

                // 2. Gọi API SePay với transaction_date_min
                var token = _config["SePay:ApiToken"];
                var url = "https://my.sepay.vn/userapi/transactions/list";
                if (lastTransactionDate.HasValue)
                    url += $"?transaction_date_min={lastTransactionDate.Value:yyyy-MM-dd HH:mm:ss}";

                var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

                var response = await _httpClient.SendAsync(request);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Không thể lấy dữ liệu từ SePay: {StatusCode}", response.StatusCode);
                    return;
                }

                var json = await response.Content.ReadAsStringAsync();
                using var doc = JsonDocument.Parse(json);

                if (!doc.RootElement.TryGetProperty("transactions", out var transactions))
                {
                    _logger.LogWarning("Không tìm thấy danh sách transactions trong response");
                    return;
                }

                // 3. Mapping sang model (giữ nguyên 100% logic cũ)
                var newTransactions = transactions.EnumerateArray()
                    .Select(t => new BankTransactionHistory
                    {
                        Id = t.GetProperty("id").GetString()!,
                        BankBrandName = t.GetProperty("bank_brand_name").GetString(),
                        AccountNumber = t.GetProperty("account_number").GetString(),
                        TransactionDate = t.TryGetProperty("transaction_date", out var dateProp)
                                            ? DateTime.Parse(dateProp.GetString()!)
                                            : null,
                        AmountOut = t.TryGetProperty("amount_out", out var outProp)
                                    ? decimal.Parse(outProp.GetString()!)
                                    : null,
                        AmountIn = t.TryGetProperty("amount_in", out var inProp)
                                   ? decimal.Parse(inProp.GetString()!)
                                   : null,
                        Accumulated = t.TryGetProperty("accumulated", out var accProp)
                                      ? decimal.Parse(accProp.GetString()!)
                                      : null,
                        TransactionContent = t.GetProperty("transaction_content").GetString(),
                        ReferenceNumber = t.GetProperty("reference_number").GetString(),
                        Code = t.TryGetProperty("code", out var codeProp) && codeProp.ValueKind != JsonValueKind.Null
                               ? codeProp.GetString()
                               : null,
                        SubAccount = t.GetProperty("sub_account").GetString(),
                        BankAccountId = t.GetProperty("bank_account_id").GetString()
                    })
                    .ToList();

                // 4. Lọc transaction đã tồn tại
                var existingIds = await _dbContext.BankTransactionHistorys
                    .Where(t => newTransactions.Select(nt => nt.Id).Contains(t.Id))
                    .Select(t => t.Id)
                    .ToListAsync();

                var transactionsToInsert = newTransactions
                    .Where(t => !existingIds.Contains(t.Id))
                    .ToList();

                if (transactionsToInsert.Count > 0)
                {
                    _dbContext.BankTransactionHistorys.AddRange(transactionsToInsert);
                    await _dbContext.SaveChangesAsync();
                    _logger.LogInformation("Đã đồng bộ {Count} giao dịch mới từ SePay", transactionsToInsert.Count);
                }
                else
                {
                    _logger.LogInformation("Không có giao dịch mới để đồng bộ");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi đồng bộ lịch sử giao dịch từ SePay");
            }
        }
    }
}
