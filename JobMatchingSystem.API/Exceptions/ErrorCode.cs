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
        public static Error EmailNotExist() => new("Email Not Exist", HttpStatusCode.NotFound);
        public static Error NotFoundUser() => new("User Not Found", HttpStatusCode.NotFound);
    }
}
