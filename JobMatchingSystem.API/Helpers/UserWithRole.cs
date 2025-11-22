using JobMatchingSystem.API.Models;

namespace JobMatchingSystem.API.Helpers
{
    public class UserWithRole
    {
        public ApplicationUser User { get; set; }
        public string RoleName { get; set; }
    }
}
