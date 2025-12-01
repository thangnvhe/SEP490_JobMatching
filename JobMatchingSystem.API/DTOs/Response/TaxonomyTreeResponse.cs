namespace JobMatchingSystem.API.DTOs.Response
{
    public class TaxonomyTreeResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? ParentId { get; set; }
        public List<TaxonomyTreeResponse> Children { get; set; } = new List<TaxonomyTreeResponse>();
    }

    public class TaxonomyFlatResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int? ParentId { get; set; }
        public string? ParentName { get; set; }
        public bool HasChildren { get; set; }
    }
}