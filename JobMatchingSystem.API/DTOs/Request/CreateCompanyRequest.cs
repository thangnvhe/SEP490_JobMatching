using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateCompanyRequest
    {
        [Required(ErrorMessage = "Họ tên không được để trống")]
        [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự")]
        public string FullName { get; set; }

        [Required(ErrorMessage = "Email công việc không được để trống")]
        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ")]
        public string Email { get; set; }

        [Required(ErrorMessage = "Số điện thoại không được để trống")]
        [Phone(ErrorMessage = "Định dạng số điện thoại không hợp lệ")]
        [StringLength(15, MinimumLength = 8, ErrorMessage = "Số điện thoại phải có từ 8-15 chữ số")]
        public string PhoneContact { get; set; }

        [Required(ErrorMessage = "Tên công ty không được để trống")]
        [StringLength(150, ErrorMessage = "Tên công ty không được vượt quá 150 ký tự")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Website không được để trống")]
        [Url(ErrorMessage = "Định dạng website không hợp lệ")]
        public string? Website { get; set; }

        [Required(ErrorMessage = "Mã số thuế không được để trống")]
        public string TaxCode { get; set; }

        [Required(ErrorMessage = "Địa chỉ không được để trống")]
        [StringLength(255, ErrorMessage = "Địa chỉ không được vượt quá 255 ký tự")]
        public string Address { get; set; }
        [Required(ErrorMessage = "Mô tả không được để trống")]
        [StringLength(255, ErrorMessage = "Mô tả không được vượt quá 255 ký tự")]
        public string Description { get; set; }
        [Required(ErrorMessage = "Giấy phép kinh doanh không được để trống")]
        [DataType(DataType.Upload)]
        public IFormFile LicenseFile { get; set; }
    }
}
