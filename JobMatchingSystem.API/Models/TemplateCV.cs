using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.Models
{
    public class TemplateCV
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string PathUrl { get; set; }
    }
}