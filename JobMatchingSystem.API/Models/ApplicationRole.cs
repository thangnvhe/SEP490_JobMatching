using JobMatchingSystem.API.Entities;
using Microsoft.AspNetCore.Identity;

namespace JobMatchingSystem.API.Models
{
    public class ApplicationRole: IdentityRole<int>
    {
        public virtual ICollection<ApplicationUser> Users { get; set; } = new List<ApplicationUser>();
    }
}
