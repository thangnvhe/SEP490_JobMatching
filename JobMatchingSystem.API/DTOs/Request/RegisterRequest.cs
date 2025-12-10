using System.ComponentModel.DataAnnotations;
using System.Net.Mail;
using System.Text.RegularExpressions;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class RegisterRequest : IValidatableObject
    {
        [Required(ErrorMessage = "Họ tên không được để trống.")]
        [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự.")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email không được để trống.")]
        [EmailAddress(ErrorMessage = "Email không hợp lệ.")]
        [StringLength(100, ErrorMessage = "Email không được vượt quá 100 ký tự.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Mật khẩu không được để trống.")]
        [DataType(DataType.Password)]
        [StringLength(100, MinimumLength = 6,
            ErrorMessage = "Mật khẩu chứa ít nhất 6 ký tự và bao gồm ít nhất 1 ký tự đặc biệt")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Xác nhận mật khẩu không được để trống.")]
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Mật khẩu không khớp.")]
        public string ConfirmPassword { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // Kiểm tra email hợp lệ với regex chi tiết
            if (!string.IsNullOrEmpty(Email))
            {
                // 1. Kiểm tra với MailAddress để validate format cơ bản
                bool isValidMailAddress = false;
                try
                {
                    var mailAddress = new MailAddress(Email);
                    isValidMailAddress = true;
                }
                catch
                {
                    isValidMailAddress = false;
                }

                if (!isValidMailAddress)
                {
                    yield return new ValidationResult(
                        "Email không đúng định dạng. Vui lòng nhập email hợp lệ (ví dụ: example@domain.com)",
                        new[] { nameof(Email) });
                    yield break;
                }

                // 2. Kiểm tra độ dài tối thiểu của local part (trước @) - ít nhất 2 ký tự
                var atIndex = Email.LastIndexOf('@');
                if (atIndex <= 0)
                {
                    yield return new ValidationResult(
                        "Email không hợp lệ. Phần trước @ không được để trống",
                        new[] { nameof(Email) });
                    yield break;
                }

                var localPart = Email.Substring(0, atIndex);
                if (localPart.Length < 2)
                {
                    yield return new ValidationResult(
                        "Email không hợp lệ. Phần trước @ phải có ít nhất 2 ký tự",
                        new[] { nameof(Email) });
                    yield break;
                }

                // 3. Pattern RFC 5322 simplified - phủ hầu hết email hợp lệ
                var emailPattern = @"^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$";
                
                if (!Regex.IsMatch(Email, emailPattern))
                {
                    yield return new ValidationResult(
                        "Email không đúng định dạng. Vui lòng nhập email hợp lệ (ví dụ: example@domain.com)",
                        new[] { nameof(Email) });
                    yield break;
                }
                
                // 4. Kiểm tra các trường hợp đặc biệt không hợp lệ
                if (Email.Contains("..") || // Không cho phép 2 dấu chấm liên tiếp
                    Email.StartsWith(".") || Email.StartsWith("-") || Email.StartsWith("_") || // Không bắt đầu bằng ký tự đặc biệt
                    Email.Contains("@.") || Email.Contains(".@") || // Không có dấu chấm liền kề @
                    Email.EndsWith(".") || Email.EndsWith("-")) // Không kết thúc bằng dấu chấm hoặc gạch ngang
                {
                    yield return new ValidationResult(
                        "Email không đúng định dạng. Vui lòng nhập email hợp lệ (ví dụ: example@domain.com)",
                        new[] { nameof(Email) });
                    yield break;
                }
                
                // 5. Kiểm tra domain phải có ít nhất 1 dấu chấm và phần sau dấu chấm cuối >= 2 ký tự
                if (atIndex > 0 && atIndex < Email.Length - 1)
                {
                    var domain = Email.Substring(atIndex + 1);
                    var lastDotIndex = domain.LastIndexOf('.');
                    
                    if (lastDotIndex < 0 || // Không có dấu chấm trong domain
                        lastDotIndex == domain.Length - 1 || // Dấu chấm ở cuối
                        domain.Length - lastDotIndex - 1 < 2) // TLD quá ngắn (< 2 ký tự)
                    {
                        yield return new ValidationResult(
                            "Email không đúng định dạng. Domain phải có đuôi hợp lệ (ví dụ: .com, .vn, .edu)",
                            new[] { nameof(Email) });
                        yield break;
                    }

                    // 6. Kiểm tra độ dài domain name (phần trước TLD) - ít nhất 2 ký tự
                    var domainName = domain.Substring(0, lastDotIndex);
                    if (domainName.Length < 2)
                    {
                        yield return new ValidationResult(
                            "Email không hợp lệ. Tên domain phải có ít nhất 2 ký tự",
                            new[] { nameof(Email) });
                        yield break;
                    }

                    // 7. Kiểm tra TLD phải là chữ cái (không có số hoặc ký tự đặc biệt)
                    var tld = domain.Substring(lastDotIndex + 1);
                    if (!Regex.IsMatch(tld, @"^[a-zA-Z]+$"))
                    {
                        yield return new ValidationResult(
                            "Email không hợp lệ. Đuôi domain phải chỉ chứa chữ cái",
                            new[] { nameof(Email) });
                    }
                }
                
                // 8. Kiểm tra độ dài local part không quá dài
                if (localPart.Length > 64) // RFC 5321: local part max 64 characters
                {
                    yield return new ValidationResult(
                        "Email không hợp lệ. Phần trước @ không được vượt quá 64 ký tự",
                        new[] { nameof(Email) });
                }
            }
            
            // Kiểm tra mật khẩu không chứa khoảng trắng
            if (!string.IsNullOrEmpty(Password) && Password.Contains(' '))
            {
                yield return new ValidationResult(
                    "Mật khẩu không được chứa khoảng trắng.",
                    new[] { nameof(Password) });
            }

            // Kiểm tra mật khẩu phải chứa ít nhất 1 ký tự đặc biệt
            if (!string.IsNullOrEmpty(Password) && !Regex.IsMatch(Password, @"[!@#$%^&*(),.?""':;{}|<>\[\]\\/_\-+=`~]"))
            {
                yield return new ValidationResult(
                    "Mật khẩu chứa ít nhất 6 ký tự và bao gồm ít nhất 1 ký tự đặc biệt",
                    new[] { nameof(Password) });
            }
        }
    }
}
