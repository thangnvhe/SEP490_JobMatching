using FluentAssertions;
using JobMatchingSystem.API.DTOs.Response;
using JobMatchingSystem.API.Models;
using JobMatchingSystem.API.Repositories.Interfaces;
using JobMatchingSystem.API.Services.Implementations;
using Moq;
using Xunit;

namespace JobMatchingSystem.Tests.Services
{
    public class TaxonomyServiceTests : IDisposable
    {
        private readonly Mock<ITaxonomyRepository> _mockTaxonomyRepository;
        private readonly TaxonomyService _taxonomyService;

        public TaxonomyServiceTests()
        {
            _mockTaxonomyRepository = new Mock<ITaxonomyRepository>();
            _taxonomyService = new TaxonomyService(_mockTaxonomyRepository.Object);
        }

        #region GetAllTaxonomiesAsync Tests

        [Fact]
        public async Task GetAllTaxonomiesAsync_ShouldReturnListOfTaxonomies()
        {
            // Arrange
            var taxonomies = new List<Taxonomy>
            {
                new Taxonomy { Id = 1, Name = "Technology", ParentId = null },
                new Taxonomy { Id = 2, Name = "Programming", ParentId = 1 }
            };

            _mockTaxonomyRepository
                .Setup(x => x.GetAllAsync())
                .ReturnsAsync(taxonomies);

            // Act
            var result = await _taxonomyService.GetAllTaxonomiesAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result[0].Id.Should().Be(1);
            result[0].Name.Should().Be("Technology");
            result[0].ParentId.Should().BeNull();
            result[1].Id.Should().Be(2);
            result[1].Name.Should().Be("Programming");
            result[1].ParentId.Should().Be(1);
            
            _mockTaxonomyRepository.Verify(x => x.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task GetAllTaxonomiesAsync_EmptyList_ShouldReturnEmptyList()
        {
            // Arrange
            var emptyList = new List<Taxonomy>();

            _mockTaxonomyRepository
                .Setup(x => x.GetAllAsync())
                .ReturnsAsync(emptyList);

            // Act
            var result = await _taxonomyService.GetAllTaxonomiesAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        #endregion

        #region GetTaxonomyTreeAsync Tests

        [Fact]
        public async Task GetTaxonomyTreeAsync_ShouldReturnHierarchicalTree()
        {
            // Arrange
            var parentTaxonomy = new Taxonomy { Id = 1, Name = "Technology", ParentId = null };
            var childTaxonomy = new Taxonomy { Id = 2, Name = "Programming", ParentId = 1 };
            var grandChildTaxonomy = new Taxonomy { Id = 3, Name = "C#", ParentId = 2 };

            var allTaxonomies = new List<Taxonomy> { parentTaxonomy, childTaxonomy, grandChildTaxonomy };

            _mockTaxonomyRepository
                .Setup(x => x.GetAllWithChildrenAsync())
                .ReturnsAsync(allTaxonomies);

            // Act
            var result = await _taxonomyService.GetTaxonomyTreeAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1); // Only root level
            result[0].Id.Should().Be(1);
            result[0].Name.Should().Be("Technology");
            result[0].Children.Should().HaveCount(1);
            result[0].Children[0].Id.Should().Be(2);
            result[0].Children[0].Name.Should().Be("Programming");
            result[0].Children[0].Children.Should().HaveCount(1);
            result[0].Children[0].Children[0].Id.Should().Be(3);
            result[0].Children[0].Children[0].Name.Should().Be("C#");

            _mockTaxonomyRepository.Verify(x => x.GetAllWithChildrenAsync(), Times.Once);
        }

        [Fact]
        public async Task GetTaxonomyTreeAsync_MultipleRoots_ShouldReturnMultipleTrees()
        {
            // Arrange
            var root1 = new Taxonomy { Id = 1, Name = "Technology", ParentId = null };
            var root2 = new Taxonomy { Id = 2, Name = "Business", ParentId = null };
            var child1 = new Taxonomy { Id = 3, Name = "Programming", ParentId = 1 };

            var allTaxonomies = new List<Taxonomy> { root1, root2, child1 };

            _mockTaxonomyRepository
                .Setup(x => x.GetAllWithChildrenAsync())
                .ReturnsAsync(allTaxonomies);

            // Act
            var result = await _taxonomyService.GetTaxonomyTreeAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2); // Two root nodes
            result.Should().Contain(x => x.Name == "Technology");
            result.Should().Contain(x => x.Name == "Business");
        }

        #endregion

        #region GetTaxonomyFlatListAsync Tests

        [Fact]
        public async Task GetTaxonomyFlatListAsync_ShouldReturnFlatListWithParentNames()
        {
            // Arrange
            var parentTaxonomy = new Taxonomy { Id = 1, Name = "Technology", ParentId = null, Parent = null };
            var childTaxonomy = new Taxonomy 
            { 
                Id = 2, 
                Name = "Programming", 
                ParentId = 1, 
                Parent = parentTaxonomy,
                Children = new List<Taxonomy>()
            };

            var taxonomies = new List<Taxonomy> { parentTaxonomy, childTaxonomy };

            _mockTaxonomyRepository
                .Setup(x => x.GetAllWithParentAsync())
                .ReturnsAsync(taxonomies);

            // Act
            var result = await _taxonomyService.GetTaxonomyFlatListAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            
            var parentResult = result.FirstOrDefault(x => x.Id == 1);
            parentResult.Should().NotBeNull();
            parentResult!.Name.Should().Be("Technology");
            parentResult.ParentId.Should().BeNull();
            parentResult.ParentName.Should().BeNull();
            parentResult.HasChildren.Should().BeFalse();
            
            var childResult = result.FirstOrDefault(x => x.Id == 2);
            childResult.Should().NotBeNull();
            childResult!.Name.Should().Be("Programming");
            childResult.ParentId.Should().Be(1);
            childResult.ParentName.Should().Be("Technology");
            childResult.HasChildren.Should().BeFalse();

            _mockTaxonomyRepository.Verify(x => x.GetAllWithParentAsync(), Times.Once);
        }

        [Fact]
        public async Task GetTaxonomyFlatListAsync_WithChildren_ShouldIndicateHasChildren()
        {
            // Arrange
            var childTaxonomy = new Taxonomy { Id = 2, Name = "Child", ParentId = 1 };
            var parentTaxonomy = new Taxonomy 
            { 
                Id = 1, 
                Name = "Parent", 
                ParentId = null, 
                Parent = null,
                Children = new List<Taxonomy> { childTaxonomy }
            };

            var taxonomies = new List<Taxonomy> { parentTaxonomy };

            _mockTaxonomyRepository
                .Setup(x => x.GetAllWithParentAsync())
                .ReturnsAsync(taxonomies);

            // Act
            var result = await _taxonomyService.GetTaxonomyFlatListAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            result[0].HasChildren.Should().BeTrue();
        }

        #endregion

        #region GetChildrenByParentIdAsync Tests

        [Fact]
        public async Task GetChildrenByParentIdAsync_ValidParentId_ShouldReturnChildren()
        {
            // Arrange
            var parentId = 1;
            var children = new List<Taxonomy>
            {
                new Taxonomy { Id = 2, Name = "Child 1", ParentId = parentId },
                new Taxonomy { Id = 3, Name = "Child 2", ParentId = parentId }
            };

            _mockTaxonomyRepository
                .Setup(x => x.GetChildrenByParentIdAsync(parentId))
                .ReturnsAsync(children);

            // Act
            var result = await _taxonomyService.GetChildrenByParentIdAsync(parentId);

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.All(x => x.ParentId == parentId).Should().BeTrue();
            result[0].Name.Should().Be("Child 1");
            result[1].Name.Should().Be("Child 2");

            _mockTaxonomyRepository.Verify(x => x.GetChildrenByParentIdAsync(parentId), Times.Once);
        }

        [Fact]
        public async Task GetChildrenByParentIdAsync_NoChildren_ShouldReturnEmptyList()
        {
            // Arrange
            var parentId = 1;
            var emptyList = new List<Taxonomy>();

            _mockTaxonomyRepository
                .Setup(x => x.GetChildrenByParentIdAsync(parentId))
                .ReturnsAsync(emptyList);

            // Act
            var result = await _taxonomyService.GetChildrenByParentIdAsync(parentId);

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        #endregion

        #region GetTaxonomyByIdAsync Tests

        [Fact]
        public async Task GetTaxonomyByIdAsync_ValidId_ShouldReturnTaxonomy()
        {
            // Arrange
            var taxonomyId = 1;
            var taxonomy = new Taxonomy { Id = taxonomyId, Name = "Technology", ParentId = null };

            _mockTaxonomyRepository
                .Setup(x => x.GetByIdAsync(taxonomyId))
                .ReturnsAsync(taxonomy);

            // Act
            var result = await _taxonomyService.GetTaxonomyByIdAsync(taxonomyId);

            // Assert
            result.Should().NotBeNull();
            result!.Id.Should().Be(taxonomyId);
            result.Name.Should().Be("Technology");
            result.ParentId.Should().BeNull();

            _mockTaxonomyRepository.Verify(x => x.GetByIdAsync(taxonomyId), Times.Once);
        }

        [Fact]
        public async Task GetTaxonomyByIdAsync_InvalidId_ShouldReturnNull()
        {
            // Arrange
            var invalidId = 999;

            _mockTaxonomyRepository
                .Setup(x => x.GetByIdAsync(invalidId))
                .ReturnsAsync((Taxonomy?)null);

            // Act
            var result = await _taxonomyService.GetTaxonomyByIdAsync(invalidId);

            // Assert
            result.Should().BeNull();

            _mockTaxonomyRepository.Verify(x => x.GetByIdAsync(invalidId), Times.Once);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(-1)]
        public async Task GetTaxonomyByIdAsync_InvalidIdValues_ShouldReturnNull(int invalidId)
        {
            // Arrange
            _mockTaxonomyRepository
                .Setup(x => x.GetByIdAsync(invalidId))
                .ReturnsAsync((Taxonomy?)null);

            // Act
            var result = await _taxonomyService.GetTaxonomyByIdAsync(invalidId);

            // Assert
            result.Should().BeNull();
        }

        #endregion

        #region GetRootTaxonomiesAsync Tests

        [Fact]
        public async Task GetRootTaxonomiesAsync_ShouldReturnRootTaxonomies()
        {
            // Arrange
            var rootTaxonomies = new List<Taxonomy>
            {
                new Taxonomy { Id = 1, Name = "Technology", ParentId = null },
                new Taxonomy { Id = 2, Name = "Business", ParentId = null }
            };

            _mockTaxonomyRepository
                .Setup(x => x.GetRootTaxonomiesAsync())
                .ReturnsAsync(rootTaxonomies);

            // Act
            var result = await _taxonomyService.GetRootTaxonomiesAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(2);
            result.All(x => x.ParentId == null).Should().BeTrue();
            result[0].Name.Should().Be("Technology");
            result[1].Name.Should().Be("Business");

            _mockTaxonomyRepository.Verify(x => x.GetRootTaxonomiesAsync(), Times.Once);
        }

        [Fact]
        public async Task GetRootTaxonomiesAsync_NoRootTaxonomies_ShouldReturnEmptyList()
        {
            // Arrange
            var emptyList = new List<Taxonomy>();

            _mockTaxonomyRepository
                .Setup(x => x.GetRootTaxonomiesAsync())
                .ReturnsAsync(emptyList);

            // Act
            var result = await _taxonomyService.GetRootTaxonomiesAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().BeEmpty();
        }

        #endregion

        #region Edge Cases and Performance Tests

        [Fact]
        public async Task GetTaxonomyTreeAsync_DeepNesting_ShouldHandleRecursion()
        {
            // Arrange
            var level1 = new Taxonomy { Id = 1, Name = "Level 1", ParentId = null };
            var level2 = new Taxonomy { Id = 2, Name = "Level 2", ParentId = 1 };
            var level3 = new Taxonomy { Id = 3, Name = "Level 3", ParentId = 2 };
            var level4 = new Taxonomy { Id = 4, Name = "Level 4", ParentId = 3 };
            var level5 = new Taxonomy { Id = 5, Name = "Level 5", ParentId = 4 };

            var allTaxonomies = new List<Taxonomy> { level1, level2, level3, level4, level5 };

            _mockTaxonomyRepository
                .Setup(x => x.GetAllWithChildrenAsync())
                .ReturnsAsync(allTaxonomies);

            // Act
            var result = await _taxonomyService.GetTaxonomyTreeAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1);
            
            // Navigate through the tree
            var current = result[0];
            for (int i = 1; i <= 5; i++)
            {
                current.Should().NotBeNull();
                current.Id.Should().Be(i);
                current.Name.Should().Be($"Level {i}");
                
                if (i < 5)
                {
                    current.Children.Should().HaveCount(1);
                    current = current.Children[0];
                }
                else
                {
                    current.Children.Should().BeEmpty();
                }
            }
        }

        [Fact]
        public async Task GetAllTaxonomiesAsync_LargeDataset_ShouldHandleEfficiently()
        {
            // Arrange
            var largeTaxonomyList = new List<Taxonomy>();
            for (int i = 1; i <= 1000; i++)
            {
                largeTaxonomyList.Add(new Taxonomy 
                { 
                    Id = i, 
                    Name = $"Taxonomy {i}", 
                    ParentId = i > 1 ? (i - 1) : null 
                });
            }

            _mockTaxonomyRepository
                .Setup(x => x.GetAllAsync())
                .ReturnsAsync(largeTaxonomyList);

            // Act
            var result = await _taxonomyService.GetAllTaxonomiesAsync();

            // Assert
            result.Should().NotBeNull();
            result.Should().HaveCount(1000);
            result.First().Name.Should().Be("Taxonomy 1");
            result.Last().Name.Should().Be("Taxonomy 1000");
        }

        #endregion

        #region IDisposable

        public void Dispose()
        {
            // Cleanup if needed
        }

        #endregion
    }
}