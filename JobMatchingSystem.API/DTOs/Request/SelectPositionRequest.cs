using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class SelectPositionRequest
    {
        [Required(ErrorMessage = "Mã vị trí không được để trống")]
        [Range(1, int.MaxValue, ErrorMessage = "Mã vị trí phải lớn hơn 0")]
        public int PositionId { get; set; }
    }
}