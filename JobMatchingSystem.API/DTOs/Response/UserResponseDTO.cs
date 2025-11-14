namespace JobMatchingSystem.API.DTOs.Response
{
    public class UserResponseDTO
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public bool? Gender { get; set; }
        public DateTime? Birthday { get; set; }
        public bool? IsActive { get; set; }
        public int? Score { get; set; }
    }
}
