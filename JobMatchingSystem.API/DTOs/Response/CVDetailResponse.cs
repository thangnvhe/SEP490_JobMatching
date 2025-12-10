namespace JobMatchingSystem.API.DTOs.Response
{
    public class CVDetailResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public bool? IsPrimary { get; set; }
        public string FileName { get; set; } = string.Empty;
        public string FileUrl { get; set; } = string.Empty;
        public UserInfoResponse User { get; set; } = new UserInfoResponse();
    }

    public class UserInfoResponse
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
    }
}