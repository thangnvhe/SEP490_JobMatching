using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class RegisterRequest : IValidatableObject
    {
        [Required(ErrorMessage = "Full name is required.")]
        [StringLength(100, ErrorMessage = "Full name must be less than 100 characters.")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email is required.")]
        [EmailAddress(ErrorMessage = "Email is invalid.")]
        [StringLength(100, ErrorMessage = "Email must be less than 100 characters.")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Password is required.")]
        [DataType(DataType.Password)]
        [StringLength(100, MinimumLength = 6,
            ErrorMessage = "Mật khẩu chứa ít nhất 6 ký tự và bao gồm ít nhất 1 ký tự đặc biệt")]
        public string Password { get; set; }

        [Required(ErrorMessage = "Confirm password is required.")]
        [DataType(DataType.Password)]
        [Compare("Password", ErrorMessage = "Passwords do not match.")]
        public string ConfirmPassword { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
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
