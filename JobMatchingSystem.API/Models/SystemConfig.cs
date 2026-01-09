using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.Models
{
    public class SystemConfig
    {
        [Key]
        public int Id { get; set; }

        public string Type { get; set; }   // vd: job, report_company, report_reporter
        public string Name { get; set; }   // vd: JobQuota, Fraudulent
        public string Value { get; set; }  // lưu string, parse khi dùng
    }
}
