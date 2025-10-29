namespace JobMatchingSystem.API.Helpers
{
    public class Pager
    {
        public int TotalItem { get; set; }
        public int TotalPage { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public bool HasPreviousPage => CurrentPage > 1;
        public bool HasNextPage => CurrentPage < TotalPage;

        public Pager() { }

        public Pager(int totalItems, int page, int pageSize)
        {
            TotalItem = totalItems;
            PageSize = pageSize;
            TotalPage = (int)Math.Ceiling((decimal)totalItems / pageSize);
            CurrentPage = Math.Clamp(page, 1, TotalPage == 0 ? 1 : TotalPage);
        }
    }
}
