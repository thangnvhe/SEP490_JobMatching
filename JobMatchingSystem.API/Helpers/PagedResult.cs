namespace JobMatchingSystem.API.Helpers
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public Pager Pager { get; set; } = null!;
    }
}
