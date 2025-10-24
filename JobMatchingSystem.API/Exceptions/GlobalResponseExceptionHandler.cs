using JobMatchingSystem.API.DTOs; // Thay bằng namespace chứa APIResponse của bạn
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.WebUtilities;
using OfficeOpenXml.Packaging.Ionic.Zip;
using System.ComponentModel.DataAnnotations;
using System.Net;
using System.Text.Json;
namespace JobMatchingSystem.API.Exceptions
{

    public class GlobalResponseExceptionHandler : IExceptionHandler
    {
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
        {
            var response = APIResponse<object>.Builder()
                .WithSuccess(false)
                .Build();
            if (exception is AppException e)
            {
                Error error = e.Error;
                httpContext.Response.StatusCode = (int)error.StatusCode;
                response.StatusCode = error.StatusCode;
                response.ErrorMessages = new List<string> { e.Message };
            }
            else
            {
                httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                response.StatusCode = HttpStatusCode.InternalServerError;
                response.ErrorMessages = new List<string> { "An unexpected error occurred. Please try again later." };
            }
            await httpContext.Response.WriteAsJsonAsync(response, cancellationToken).ConfigureAwait(false);
            return true;
        }
    }
    
}
