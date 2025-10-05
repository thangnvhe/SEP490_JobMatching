namespace JobMatchingSystem.Application.DTOs
{
    public class ResponseModel
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }

    public class ResponseModel<T> : ResponseModel
    {
        public T Data { get; set; }
    }
}