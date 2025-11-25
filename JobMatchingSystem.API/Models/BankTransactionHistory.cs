using System.ComponentModel.DataAnnotations;

namespace JobMatchingSystem.API.Models
{
    public class BankTransactionHistory
    {
        public string Id { get; set; } = null!;

        public string? BankBrandName { get; set; }

        public string? AccountNumber { get; set; }

        public DateTime? TransactionDate { get; set; }

        public decimal? AmountOut { get; set; }

        public decimal? AmountIn { get; set; }

        public decimal? Accumulated { get; set; }

        public string? TransactionContent { get; set; }

        public string? ReferenceNumber { get; set; }

        public string? Code { get; set; }

        public string? SubAccount { get; set; }

        public string? BankAccountId { get; set; }
    }
}
