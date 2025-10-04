using Microsoft.AspNetCore.Mvc;

namespace JobMatchingSystem.UI.Areas.Public.Controllers
{
    [Area("Public")]
    public class CompanyController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
