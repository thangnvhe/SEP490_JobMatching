using Microsoft.AspNetCore.Mvc;

namespace JobMatchingSystem.UI.Areas.Public.Controllers
{
    [Area("Public")]
    public class AuthController : Controller
    {
        public IActionResult Login()
        {
            return View();
        }
        public IActionResult Register()
        {
            return View();
        }
        public IActionResult ForgotPassword()
        {
            return View();
        }
    }
}
