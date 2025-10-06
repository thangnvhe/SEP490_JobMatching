using Microsoft.AspNetCore.Mvc;

namespace JobMatchingSystem.UI.Areas.Admin.Controllers
{

    [Area("Admin")]
    public class AdminController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}