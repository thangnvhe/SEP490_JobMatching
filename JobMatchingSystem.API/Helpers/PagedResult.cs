namespace JobMatchingSystem.API.Helpers
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public PageInfo pageInfo { get; set; } = null!;
    }
}
