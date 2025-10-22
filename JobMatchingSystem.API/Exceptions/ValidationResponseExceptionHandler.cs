using JobMatchingSystem.API.DTOs; // Thay bằng namespace chứa APIResponse của bạn
using Microsoft.AspNetCore.Diagnostics;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
//using vivuvn_api.Exceptions; // Thay bằng namespace chứa ValidationException của bạn
namespace JobMatchingSystem.API.Exceptions
{
    // Lớp này không cần IProblemDetailsService nữa
    public class ValidationResponseExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            // 1. Kiểm tra loại ngoại lệ
            if (exception is not ValidationException validationException)
                return false; // Không phải ValidationException, pass cho handler khác

            // 2. Thiết lập Response Header và StatusCode
            httpContext.Response.ContentType = "application/json";
            httpContext.Response.StatusCode = StatusCodes.Status400BadRequest;

            // 3. Trích xuất thông tin lỗi từ ValidationException
            var errorMessages = new List<string>();

            // Lặp qua Dictionary<string, string[]> Errors để lấy tất cả lỗi
            foreach (var (key, errors) in validationException.Errors)
            {
                // Thêm lỗi dưới dạng "Field: Error Message"
                foreach (var error in errors)
                {
                    errorMessages.Add($"{key}: {error}");
                }
            }

            // Nếu ValidationException không có lỗi chi tiết, lấy thông báo chung
            if (!errorMessages.Any())
            {
                errorMessages.Add(validationException.Message);
            }

            // 4. Xây dựng đối tượng APIResponse<object>
            var response = APIResponse<object>.Builder()
                .WithStatusCode(HttpStatusCode.BadRequest)
                .WithSuccess(false)
                .WithErrorMessages(errorMessages) // Thêm danh sách lỗi chi tiết
                .Build();

            // 5. Ghi đối tượng APIResponse vào HttpContext.Response
            await httpContext.Response.WriteAsync(JsonSerializer.Serialize(response), cancellationToken);

            return true; // Đánh dấu là đã xử lý xong ngoại lệ
        }
    }
    
}
