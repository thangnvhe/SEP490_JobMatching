using JobMatchingSystem.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace JobMatchingSystem.API.Helpers
{
    public static class Untity
    {
        private static readonly string Upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        private static readonly string Lower = "abcdefghijklmnopqrstuvwxyz";
        private static readonly string Digits = "0123456789";
        private static readonly string Special = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        public static string GenerateAccessToken(ApplicationUser user, IEnumerable<string> roles, IConfiguration _configuration)
        {
            var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.UserName),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

            foreach (var role in roles)
                claims.Add(new Claim(ClaimTypes.Role, role));
            var jwtSettings = _configuration.GetSection("Jwt");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.GetValue<string>("Key")));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: jwtSettings.GetValue<string>("Issuer"),
                audience: jwtSettings.GetValue<string>("Audience"),
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
        public static string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }
        public static string Generate(int length = 12)
        {
            var random = new Random();
            var chars = new List<char>();


            chars.Add(Upper[random.Next(Upper.Length)]);
            chars.Add(Lower[random.Next(Lower.Length)]);
            chars.Add(Digits[random.Next(Digits.Length)]);
            chars.Add(Special[random.Next(Special.Length)]);
            string all = Upper + Lower + Digits + Special;
            for (int i = chars.Count; i < length; i++)
            {
                chars.Add(all[random.Next(all.Length)]);
            }
            return new string(chars.OrderBy(_ => random.Next()).ToArray());
        }
    }
}
