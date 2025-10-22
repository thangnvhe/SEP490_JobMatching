using JobMatchingSystem.API.DTOs; // Thay bằng namespace chứa APIResponse của bạn
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.WebUtilities;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
//using vivuvn_api.Exceptions; // Thay bằng namespace chứa ValidationException của bạn

namespace JobMatchingSystem.API.Exceptions
{
    // Lớp này không cần IProblemDetailsService nữa
    public class GlobalResponseExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            // Bỏ qua ngoại lệ xác thực vì chúng ta có handler riêng cho nó
            if (exception is ValidationException)
            {
                return false; // Trả về false để chuyển cho handler tiếp theo (ValidationResponseExceptionHandler) xử lý
            }

            // 1. Xác định mã trạng thái HTTP và thông báo lỗi
            (int statusCode, HttpStatusCode httpStatusCode, string title) = exception switch
            {
                KeyNotFoundException => (StatusCodes.Status404NotFound, HttpStatusCode.NotFound, "Not Found"),
                UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, HttpStatusCode.Unauthorized, "Unauthorized"),
                BadHttpRequestException => (StatusCodes.Status400BadRequest, HttpStatusCode.BadRequest, "Bad Request"),
                ArgumentException => (StatusCodes.Status400BadRequest, HttpStatusCode.BadRequest, "Bad Request"),
                _ => (StatusCodes.Status500InternalServerError, HttpStatusCode.InternalServerError, "Internal Server Error")
            };

            // 2. Thiết lập Response Header và StatusCode
            httpContext.Response.ContentType = "application/json";
            httpContext.Response.StatusCode = statusCode;

            // 3. Xây dựng đối tượng APIResponse<object>
            // Sử dụng <object> vì đây là response lỗi và không có dữ liệu Result cụ thể.
            var response = APIResponse<object>.Builder()
                .WithStatusCode(httpStatusCode)
                .WithSuccess(false)
                .WithMessage(exception.Message) // Chi tiết lỗi từ ngoại lệ
                .Build();

            // 4. Ghi đối tượng APIResponse vào HttpContext.Response
            await httpContext.Response.WriteAsync(JsonSerializer.Serialize(response), cancellationToken);

            return true; // Đánh dấu là đã xử lý xong ngoại lệ
        }
    }
    
}
