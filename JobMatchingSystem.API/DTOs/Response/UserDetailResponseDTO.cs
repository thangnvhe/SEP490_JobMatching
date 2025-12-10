namespace JobMatchingSystem.API.DTOs.Response
{
    public class UserDetailResponseDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public bool Gender { get; set; }
        public DateTime Birthday { get; set; }
        public bool IsActive { get; set; }
        public int? Score { get; set; }
        public int? CompanyId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Role { get; set; }
    }
}