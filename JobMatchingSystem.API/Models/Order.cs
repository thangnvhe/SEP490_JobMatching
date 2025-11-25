using JobMatchingSystem.API.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace JobMatchingSystem.API.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string TransferContent { get; set; } = null!;
        public OrderStatus Status { get; set; } = OrderStatus.Pending;
        public int BuyerId { get; set; }
        public int ServiceId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("BuyerId")]
        public virtual ApplicationUser Buyer { get; set; } = null!;
        [ForeignKey("ServiceId")]
        public virtual ServicePlan ServicePlan { get; set; } = null!;
    }
}
