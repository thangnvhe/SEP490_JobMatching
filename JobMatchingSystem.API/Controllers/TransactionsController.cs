using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Headers;

namespace JobMatchingSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransactionsController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _config;

        public TransactionsController(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _config = config;
        }

        [HttpGet]
        public async Task<IActionResult> GetTransactions(
            string? account_number,
            string? transaction_date_min,
            string? transaction_date_max,
            string? since_id,
            int? limit,
            string? reference_number,
            string? amount_in,
            string? amount_out
        )
        {
            var token = _config["SePay:ApiToken"];

            var url = "https://my.sepay.vn/userapi/transactions/list";

            var queryParams = new List<string>();

            if (!string.IsNullOrEmpty(account_number))
                queryParams.Add($"account_number={account_number}");
            if (!string.IsNullOrEmpty(transaction_date_min))
                queryParams.Add($"transaction_date_min={transaction_date_min}");
            if (!string.IsNullOrEmpty(transaction_date_max))
                queryParams.Add($"transaction_date_max={transaction_date_max}");
            if (!string.IsNullOrEmpty(since_id))
                queryParams.Add($"since_id={since_id}");
            if (limit.HasValue)
                queryParams.Add($"limit={limit}");
            if (!string.IsNullOrEmpty(reference_number))
                queryParams.Add($"reference_number={reference_number}");
            if (!string.IsNullOrEmpty(amount_in))
                queryParams.Add($"amount_in={amount_in}");
            if (!string.IsNullOrEmpty(amount_out))
                queryParams.Add($"amount_out={amount_out}");

            if (queryParams.Count > 0)
                url += "?" + string.Join("&", queryParams);

            var request = new HttpRequestMessage(HttpMethod.Get, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = await _httpClient.SendAsync(request);

            if (!response.IsSuccessStatusCode)
            {
                return StatusCode((int)response.StatusCode, "Không thể lấy dữ liệu từ SePay");
            }

            var json = await response.Content.ReadAsStringAsync();

            return Content(json, "application/json");
        }
    }
}
