using Microsoft.AspNetCore.Mvc;

namespace JobMatchingSystem.UI.Areas.Public.Controllers
{
    [Area("Public")]
    public class JobController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Detail(int id)
        {
            ViewBag.JobId = id;
            return View();
        }
    }
}
