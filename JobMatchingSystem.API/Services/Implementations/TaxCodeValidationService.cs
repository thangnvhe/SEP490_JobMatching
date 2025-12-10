using JobMatchingSystem.API.Services.Interfaces;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace JobMatchingSystem.API.Services.Implementations
{
    public class TaxCodeValidationService : ITaxCodeValidationService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<TaxCodeValidationService> _logger;

        public TaxCodeValidationService(HttpClient httpClient, ILogger<TaxCodeValidationService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<TaxCodeValidationResult> ValidateTaxCodeAsync(string taxCode)
        {
            try
            {
                // Kiểm tra định dạng cơ bản của mã số thuế Việt Nam
                if (string.IsNullOrWhiteSpace(taxCode) || taxCode.Length < 10 || taxCode.Length > 14)
                {
                    return new TaxCodeValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = "Mã số thuế phải có từ 10-14 ký tự"
                    };
                }

                // Kiểm tra chỉ chứa số
                if (!taxCode.All(char.IsDigit))
                {
                    return new TaxCodeValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = "Mã số thuế chỉ được chứa các ký tự số"
                    };
                }

                // Thử gọi API VietQR để kiểm tra
                var url = $"https://api.vietqr.io/v2/business/{taxCode}";
                
                _logger.LogInformation("Validating tax code: {TaxCode}", taxCode);
                
                // Thêm headers để tránh bị block
                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                
                var response = await _httpClient.GetAsync(url);
                var jsonContent = await response.Content.ReadAsStringAsync();
                
                _logger.LogInformation("API Response Status: {StatusCode}, Content: {Content}", response.StatusCode, jsonContent);
                
                if (response.IsSuccessStatusCode)
                {
                    var apiResponse = JsonSerializer.Deserialize<VietQRBusinessResponse>(jsonContent, new JsonSerializerOptions
                    {
                        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                        PropertyNameCaseInsensitive = true
                    });

                    if (apiResponse?.Code == "00" && apiResponse.Data != null)
                    {
                        return new TaxCodeValidationResult
                        {
                            IsValid = true,
                            CompanyName = apiResponse.Data.Name ?? string.Empty,
                            Address = apiResponse.Data.Address ?? string.Empty,
                            Status = "Active"
                        };
                    }
                    else
                    {
                        return new TaxCodeValidationResult
                        {
                            IsValid = false,
                            ErrorMessage = $"Mã số thuế {taxCode} không hợp lệ hoặc không tồn tại"
                        };
                    }
                }
                else
                {
                    // Nếu API external fail, vẫn cho phép đăng ký với validate cơ bản
                    _logger.LogWarning("External API failed. Status: {StatusCode}, Content: {Content}", response.StatusCode, jsonContent);
                    
                    return new TaxCodeValidationResult
                    {
                        IsValid = true,
                        CompanyName = string.Empty,
                        Address = string.Empty,
                        Status = "Pending Verification"
                    };
                }
            }
            catch (HttpRequestException httpEx)
            {
                _logger.LogError(httpEx, "HTTP error while validating tax code: {TaxCode}", taxCode);
                // Fallback: cho phép đăng ký nếu external API có lỗi
                return new TaxCodeValidationResult
                {
                    IsValid = true,
                    CompanyName = string.Empty,
                    Address = string.Empty,
                    Status = "Pending Verification"
                };
            }
            catch (JsonException jsonEx)
            {
                _logger.LogError(jsonEx, "JSON parsing error while validating tax code: {TaxCode}", taxCode);
                // Fallback: cho phép đăng ký nếu parsing fail
                return new TaxCodeValidationResult
                {
                    IsValid = true,
                    CompanyName = string.Empty,
                    Address = string.Empty,
                    Status = "Pending Verification"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error validating tax code: {TaxCode}", taxCode);
                // Fallback: cho phép đăng ký nếu có lỗi bất ngờ
                return new TaxCodeValidationResult
                {
                    IsValid = true,
                    CompanyName = string.Empty,
                    Address = string.Empty,
                    Status = "Pending Verification"
                };
            }
        }
    }

    // DTO classes for VietQR API response
    public class VietQRBusinessResponse
    {
        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;

        [JsonPropertyName("desc")]
        public string Desc { get; set; } = string.Empty;

        [JsonPropertyName("data")]
        public VietQRBusinessData? Data { get; set; }
    }

    public class VietQRBusinessData
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; } = string.Empty;

        [JsonPropertyName("short_name")]
        public string ShortName { get; set; } = string.Empty;

        [JsonPropertyName("code")]
        public string Code { get; set; } = string.Empty;

        [JsonPropertyName("bin")]
        public string Bin { get; set; } = string.Empty;

        [JsonPropertyName("vietqr")]
        public int VietQR { get; set; }

        [JsonPropertyName("lookup_supported")]
        public int LookupSupported { get; set; }

        [JsonPropertyName("swift_code")]
        public string SwiftCode { get; set; } = string.Empty;

        [JsonPropertyName("logo")]
        public string Logo { get; set; } = string.Empty;

        [JsonPropertyName("transfer_supported")]
        public int TransferSupported { get; set; }

        [JsonPropertyName("fast_transfer_supported")]
        public int FastTransferSupported { get; set; }

        [JsonPropertyName("support_lookup_account_name")]
        public int SupportLookupAccountName { get; set; }

        [JsonPropertyName("bank_id")]
        public int BankId { get; set; }

        [JsonPropertyName("display_name")]
        public string DisplayName { get; set; } = string.Empty;

        [JsonPropertyName("full_name")]
        public string FullName { get; set; } = string.Empty;

        [JsonPropertyName("branch_name")]
        public string BranchName { get; set; } = string.Empty;

        [JsonPropertyName("joint_stock_company")]
        public string JointStockCompany { get; set; } = string.Empty;

        [JsonPropertyName("short_joint_stock_company")]
        public string ShortJointStockCompany { get; set; } = string.Empty;

        [JsonPropertyName("address")]
        public string Address { get; set; } = string.Empty;

        [JsonPropertyName("city_name")]
        public string CityName { get; set; } = string.Empty;

        [JsonPropertyName("district_prefix")]
        public string DistrictPrefix { get; set; } = string.Empty;

        [JsonPropertyName("district_name")]
        public string DistrictName { get; set; } = string.Empty;

        [JsonPropertyName("ward_prefix")]
        public string WardPrefix { get; set; } = string.Empty;

        [JsonPropertyName("ward_name")]
        public string WardName { get; set; } = string.Empty;
    }
}