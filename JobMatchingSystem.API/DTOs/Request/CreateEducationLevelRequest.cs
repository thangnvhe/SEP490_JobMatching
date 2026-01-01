using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.DTOs.Request
{
    public class CreateEducationLevelRequest
    {
        [Required(ErrorMessage = "Tên trình độ không được để trống")]
        [StringLength(100, ErrorMessage = "Tên trình độ không được vượt quá 100 ký tự")]
        public string LevelName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Điểm xếp hạng không được để trống")]
        [Range(0, 1000, ErrorMessage = "Điểm xếp hạng phải từ 0 đến 1000")]
        public int RankScore { get; set; }
    }
}
