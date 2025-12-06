namespace JobMatchingSystem.API.DTOs.Response
{
    public class TaxonomyResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int[] ChildrenIds { get; set; } = Array.Empty<int>();
    }
}
