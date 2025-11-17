using System.Net;

namespace JobMatchingSystem.API.Exceptions
{
    public static class ErrorCode
    {
        public static Error InvalidCredentials() => new("Invalid email or password.", HttpStatusCode.Unauthorized);
        public static Error InvalidCreate() => new("Create Failed",HttpStatusCode.BadRequest);
        public static Error NotFoundCompany()=>new("Not Found Compamy",HttpStatusCode.NotFound);
        public static Error InValidToken() => new("Invalid Token",HttpStatusCode.BadRequest);
        public static Error EmailExist() => new("Email Exist", HttpStatusCode.BadRequest);
        public static Error NotFoundRecruiter() => new("Not Found Recruiter", HttpStatusCode.NotFound);
        public static Error InvalidStatus() => new("Invalid Status", HttpStatusCode.BadRequest);
        public static Error NotFoundJob() => new("Not Found Job", HttpStatusCode.NotFound);
        public static Error NotFoundJobStage() => new("Not Found JobStage", HttpStatusCode.NotFound);
        public static Error SalaryError() => new("Salary min large than Salary max", HttpStatusCode.BadRequest);
        public static Error NotFoundUser() => new("Not Found User", HttpStatusCode.NotFound);
        public static Error EmailNotExist() => new("Email Not Exist", HttpStatusCode.NotFound);
        public static Error NotFoundTemplateCV() => new("Not Found TemplateCV", HttpStatusCode.NotFound);
        public static Error NotFoundCV() => new("Not Found CV", HttpStatusCode.NotFound);
        public static Error NotFoundCVCertificate() => new("Not Found CVCertificate", HttpStatusCode.NotFound);
        public static Error NotFoundCVAchievement() => new("Not Found CVAchievement", HttpStatusCode.NotFound);
        public static Error NotFoundCVEducation() => new("Not Found CVEducation", HttpStatusCode.NotFound);
        public static Error NotFoundCVExperience() => new("Not Found CVExperience", HttpStatusCode.NotFound);
        public static Error NotFoundCVProject() => new("Not Found CVProject", HttpStatusCode.NotFound);
        public static Error InvalidFile() => new("Invalid File", HttpStatusCode.BadRequest);
        public static Error NotFoundSkill() => new("Not Found Skill", HttpStatusCode.NotFound);
        public static Error CantDelete() => new("Can't Delete", HttpStatusCode.BadRequest);
        public static Error NotConfirmEmail() => new("Email is Not Confirm",HttpStatusCode.BadRequest);
        public static Error AccountIsBand() => new("Account is Band",HttpStatusCode.BadRequest);
        public static Error CantUpdate() => new("Can't update", HttpStatusCode.BadRequest);
        public static Error IsApplyJob() => new("Job is apply",HttpStatusCode.BadRequest);
        public static Error NotFoundCandidateJob() => new("NotFound CandidateJob",HttpStatusCode.NotFound);
        public static Error NotFoundReport() => new("Not Found Report", HttpStatusCode.NotFound);
    }
}
