using JobMatchingSystem.API.Entities;
using JobMatchingSystem.API.Enums;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace JobMatchingSystem.API.Data.SeedData
{
    public static class CompanySeeder
    {
        public static async Task SeedCompaniesAsync(this WebApplication webApplication)
        {
            using var scope = webApplication.Services.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            if (context.Companies.Any()) return;

            var companyNames = new[]
                    {
                "FPT Software", "TMA Solutions", "VNG Corporation", "VCCorp", "NashTech Vietnam",
                "KMS Technology", "Global Cybersoft", "Harvey Nash Vietnam", "Axon Active Vietnam",
                "Hitachi Vantara Vietnam", "DXC Technology Vietnam", "Rikkeisoft", "VNPT IT", "CMC Global",
                "Misa JSC", "Sutrix Solutions", "FPT Information System", "Niteco Vietnam", "Teko Vietnam",
                "VTI Group", "Sun Asterisk Vietnam", "SotaTek", "Be Group", "One Mount Group", "Viettel Digital Services",
                "MoMo", "ZaloPay", "Shopee Vietnam", "Lazada Vietnam", "Tiki Corporation", "Sendo", "Trusting Social",
                "NextPay", "Cake by VPBank", "Kredivo Vietnam", "Payoo", "Fundiin", "Finhay", "Utop", "Zion",
                "OnPoint E-commerce", "KiotViet", "Gosell", "Haravan", "Logivan",
                "Vietcombank Digital Center", "Techcombank Digital Innovation Lab", "MB Bank Tech Division",
                "VPBank Digital", "ACB Technology Center", "BIDV SmartBanking Team", "TPBank Digital",
                "HDBank Technology Unit", "Sacombank IT Center", "SHB Digital Banking", "VIB Innovation Lab",
                "Eximbank IT Department", "MSB Digital", "VietinBank IT Solutions", "OCB Digital Transformation Office",
                "DEK Technologies Vietnam", "Kyanon Digital", "Tek Experts", "Evolable Asia", "Positive Thinking Company",
                "Bosch Vietnam Software Center", "Renesas Design Vietnam", "Toshiba Software Development Vietnam",
                "LG Electronics Vietnam R&D", "Samsung SDS Vietnam"
            };

            var rnd = new Random();
            var now = DateTime.UtcNow;

            // 📍 Danh sách địa chỉ mẫu phân bố thật
            var locations = new[]
            {
                // Hà Nội
                "Cầu Giấy, Hà Nội",
                "Hai Bà Trưng, Hà Nội",
                "Nam Từ Liêm, Hà Nội",
                "Thanh Xuân, Hà Nội",
                "Đống Đa, Hà Nội",
                // TP.HCM
                "Quận 1, TP. Hồ Chí Minh",
                "Quận 3, TP. Hồ Chí Minh",
                "Quận 7, TP. Hồ Chí Minh",
                "Thủ Đức, TP. Hồ Chí Minh",
                "Bình Thạnh, TP. Hồ Chí Minh",
                // Đà Nẵng
                "Hải Châu, Đà Nẵng",
                "Thanh Khê, Đà Nẵng",
                // Cần Thơ
                "Ninh Kiều, Cần Thơ",
                // Huế
                "TP. Huế, Thừa Thiên Huế",
                // Hải Phòng
                "Ngô Quyền, Hải Phòng",
            };

            var companies = companyNames.Select((name, i) =>
            {
                var address = $"Số {rnd.Next(1, 300)}, {locations[rnd.Next(locations.Length)]}";

                return new Company
                {
                    CompanyName = name,
                    Description = $"Công ty {name} là một trong những đơn vị hàng đầu trong lĩnh vực CNTT và chuyển đổi số tại Việt Nam.",
                    Logo = $"/company-logos/{i + 1}.png",
                    Email = $"contact@{RemoveDiacritics(name).Replace(" ", "-").ToLowerInvariant()}.com",
                    Website = $"https://www.{RemoveDiacritics(name).Replace(" ", "").ToLowerInvariant()}.com",
                    Address = address,
                    PhoneContact = $"09{rnd.Next(10000000, 99999999)}",
                    TaxCode = $"{rnd.Next(100000000, 999999999)}",
                    LicenseFile = $"license-{i + 1}.pdf",
                    Status = CompanyStatus.Approved,
                    Point = rnd.Next(50, 500),
                    VerifiedAt = now,
                    CreatedAt = now.AddDays(-rnd.Next(1, 300)),
                    UpdatedAt = now,
                    IsActive = true
                };
            }).ToList();

            context.Companies.AddRange(companies);
            await context.SaveChangesAsync();
        }

        static string RemoveDiacritics(string s)
        {
            var normalized = s.Normalize(NormalizationForm.FormD);
            var sb = new StringBuilder();
            foreach (var ch in normalized)
            {
                var uc = CharUnicodeInfo.GetUnicodeCategory(ch);
                if (uc != UnicodeCategory.NonSpacingMark)
                    sb.Append(ch);
            }
            return sb.ToString().Normalize(NormalizationForm.FormC);
        }

    }
}
