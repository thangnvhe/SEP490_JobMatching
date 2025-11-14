namespace JobMatchingSystem.API.Helpers
{
    public class PageInfo
    {
        public int TotalItem { get; set; }
        public int TotalPage { get; set; }
        public int CurrentPage { get; set; }
        public int PageSize { get; set; }
        public bool HasPreviousPage => CurrentPage > 1;
        public bool HasNextPage => CurrentPage < TotalPage;
        public string SortBy { get; set; }
        public bool IsDecending { get; set; }
        public PageInfo() { }

        public PageInfo(int totalItems, int page, int pageSize, string sortBy, bool isDencending)
        {
            TotalItem = totalItems;
            PageSize = pageSize;
            TotalPage = (int)Math.Ceiling((decimal)totalItems / pageSize);
            CurrentPage = Math.Clamp(page, 1, TotalPage == 0 ? 1 : TotalPage);
            IsDecending = isDencending;
            SortBy = sortBy;
        }
    }
}
