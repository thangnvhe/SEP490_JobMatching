using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class UpdatePositionRequest
    {
        [Required(ErrorMessage = "Tên vị trí không được để trống")]
        [StringLength(100, ErrorMessage = "Tên vị trí không được vượt quá 100 ký tự")]
        public string Name { get; set; }
        
    }
}