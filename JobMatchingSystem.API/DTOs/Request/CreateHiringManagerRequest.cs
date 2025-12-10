using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateHiringManagerRequest : IValidatableObject
    {
        [Required(ErrorMessage = "Họ và tên là bắt buộc")]
        [StringLength(100, ErrorMessage = "Họ và tên không được vượt quá 100 ký tự")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email là bắt buộc")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ")]
        [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Số điện thoại là bắt buộc")]
        [Phone(ErrorMessage = "Số điện thoại không hợp lệ")]
        [StringLength(15, ErrorMessage = "Số điện thoại không được vượt quá 15 ký tự")]
        public string Phone { get; set; } = string.Empty;

        [Required(ErrorMessage = "Company ID là bắt buộc")]
        public int CompanyId { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // Kiểm tra email hợp lệ với regex chi tiết
            if (!string.IsNullOrEmpty(Email))
            {
                // Pattern RFC 5322 simplified - phủ hầu hết email hợp lệ
                var emailPattern = @"^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$";
                
                if (!Regex.IsMatch(Email, emailPattern))
                {
                    yield return new ValidationResult(
                        "Email không đúng định dạng. Vui lòng nhập email hợp lệ (ví dụ: example@domain.com)",
                        new[] { nameof(Email) });
                }
                
                // Kiểm tra các trường hợp đặc biệt không hợp lệ
                if (Email.Contains("..") || // Không cho phép 2 dấu chấm liên tiếp
                    Email.StartsWith(".") || Email.StartsWith("-") || Email.StartsWith("_") || // Không bắt đầu bằng ký tự đặc biệt
                    Email.Contains("@.") || Email.Contains(".@") || // Không có dấu chấm liền kề @
                    Email.EndsWith(".") || Email.EndsWith("-")) // Không kết thúc bằng dấu chấm hoặc gạch ngang
                {
                    yield return new ValidationResult(
                        "Email không đúng định dạng. Vui lòng nhập email hợp lệ (ví dụ: example@domain.com)",
                        new[] { nameof(Email) });
                }
            }
        }
    }
}