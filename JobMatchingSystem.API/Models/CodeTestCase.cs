using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Entities
{
    public class CodeTestCase
    {
        [Key]
        public int Id { get; set; }
        public int CodeId { get; set; }
        public string? InputData { get; set; }
        public string? ExpectedData { get; set; }
        // Navigation property
        [ForeignKey("CodeId")]
        public Code? Code { get; set; } = null;
        public bool isDelete{ get; set; }=false;
    }
}
