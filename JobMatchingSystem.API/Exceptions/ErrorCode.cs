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
        public static Error NotFoundRecruiter() => new("Not Found Recruiter", HttpStatusCode.BadRequest);
        public static Error InvalidStatus() => new("Invalid Status", HttpStatusCode.BadRequest);
        public static Error NotFoundJob() => new("Not Found Job", HttpStatusCode.BadRequest);
        public static Error SalaryError() => new("Salary min large than Salary max", HttpStatusCode.BadRequest);
        public static Error NotFoundCandidateProfile() => new("Not Found Candidate Profile", HttpStatusCode.BadRequest);
    }
}
