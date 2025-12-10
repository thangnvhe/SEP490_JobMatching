using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdateUserByAdminRequest
    {
        [StringLength(100, ErrorMessage = "Họ tên không được vượt quá 100 ký tự")]
        public string? fullName { get; set; }

        [EmailAddress(ErrorMessage = "Định dạng email không hợp lệ")]
        public string? email { get; set; }

        [StringLength(15, ErrorMessage = "Số điện thoại không được vượt quá 15 ký tự")]
        [RegularExpression(@"^[0-9\-\+\(\)\s]+$", ErrorMessage = "Định dạng số điện thoại không hợp lệ")]
        public string? phoneNumber { get; set; }    
        [StringLength(500, ErrorMessage = "Địa chỉ không được vượt quá 500 ký tự")]
        public string? address { get; set; }

        public DateTime? birthday { get; set; }

        [StringLength(10, ErrorMessage = "Giới tính phải là 'Nam', 'Nữ', hoặc 'Khác'")]
        public string? gender { get; set; }

        public IFormFile? avatarFile { get; set; }

        public bool? isActive { get; set; }
        [StringLength(50, ErrorMessage = "Tên vai trò không được vượt quá 50 ký tự")]
        public string? role { get; set; }

        // For recruiters - company assignment
        public int? companyId { get; set; }
    }
}