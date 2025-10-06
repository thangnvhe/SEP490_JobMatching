using Microsoft.AspNetCore.Mvc;

namespace JobMatchingSystem.UI.Areas.Candidate.Controllers
{
    [Area("Candidate")]
    public class CandidateController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}