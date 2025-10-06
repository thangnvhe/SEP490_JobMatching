using Microsoft.AspNetCore.Mvc;

namespace JobMatchingSystem.UI.Areas.Admin.Controllers
{

    [Area("Recruiter")]
    public class RecruiterController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}