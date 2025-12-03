# 🧪 Unit Tests - Hệ Thống Tìm Kiếm Việc Làm

## 📋 Tổng Quan
Project này chứa các unit test cho API JobMatchingSystem sử dụng framework xUnit với Moq cho mocking và FluentAssertions để có syntax assertion dễ đọc hơn.

## 🏗️ Cấu Trúc Project

```
JobMatchingSystem.Tests/
├── Services/                    # Unit tests cho tầng Service
│   ├── TemplateCvServiceTests.cs
│   ├── JobMatchingServiceTests.cs
│   ├── OrderServiceTests.cs
│   └── UserServiceTests.cs
├── Controllers/                 # Unit tests cho tầng Controller
│   ├── TemplateCvControllerTests.cs
│   ├── JobMatchingControllerTests.cs
│   └── OrderControllerTests.cs
├── Repositories/               # Unit tests cho tầng Repository
│   ├── TemplateCvRepositoryTests.cs
│   └── JobRepositoryTests.cs
├── Helpers/                    # Các tiện ích và helper cho test
│   ├── TestDbContextFactory.cs
│   └── TestDataBuilder.cs
└── IntegrationTests/          # Integration tests end-to-end
    ├── JobMatchingIntegrationTests.cs
    └── OrderFlowIntegrationTests.cs
```

## 📦 Các Thư Viện Phụ Thuộc

- **xUnit**: Framework testing
- **Moq**: Framework mocking cho interfaces
- **FluentAssertions**: Syntax assertion tốt hơn
- **EntityFrameworkCore.InMemory**: Database in-memory cho testing
- **Microsoft.AspNetCore.Mvc.Testing**: Hỗ trợ integration testing
- **AutoMapper**: Để test các cấu hình mapping

## 🚀 Bắt Đầu

### Chạy Tests

```bash
# Chạy tất cả tests
dotnet test

# Chạy tests với coverage
dotnet test --collect:"XPlat Code Coverage"

# Chạy test class cụ thể
dotnet test --filter "FullyQualifiedName~TemplateCvServiceTests"

# Chạy tests theo category
dotnet test --filter "Category=Unit"
```

### Viết Tests Mới

1. **Service Tests**: Tập trung vào business logic, sử dụng Moq để mock dependencies
2. **Controller Tests**: Test HTTP responses, authorization, validation
3. **Repository Tests**: Test data access logic với InMemory database
4. **Integration Tests**: Test các workflow hoàn chỉnh end-to-end

## 📋 Phân Loại Tests

### 🔧 Unit Tests (Services)
Test các method của service riêng lẻ:
- Validation đầu vào
- Business logic
- Exception handling
- Tương tác với dependencies

### 🎮 Controller Tests
Test các API endpoints:
- HTTP status codes
- Request/response models
- Authorization rules
- Model validation

### 💾 Repository Tests
Test data access:
- Các thao tác CRUD
- Query filtering
- Relationships
- Transactions

### 🔗 Integration Tests
Test các scenario hoàn chỉnh:
- Workflow end-to-end
- Tích hợp database
- Gọi external services
- Authentication flows

## 🎯 Quy Ước Đặt Tên Test

```csharp
[TênMethod]_[Tình huống]_Should[KếtQuảMongĐợi]

// Ví dụ:
CreateTemplateAsync_ValidRequest_ShouldCreateTemplate()
GetByIdAsync_InvalidId_ShouldThrowAppException()
DeleteAsync_TemplateNotFound_ShouldThrowAppException()
```

## 📊 Test Data Builders

Sử dụng builder pattern cho test data:

```csharp
public class TemplateCvBuilder
{
    private TemplateCv _template = new TemplateCv();
    
    public TemplateCvBuilder WithName(string name)
    {
        _template.Name = name;
        return this;
    }
    
    public TemplateCv Build() => _template;
}

// Sử dụng trong tests:
var template = new TemplateCvBuilder()
    .WithName("Test Template")
    .WithDescription("Test Description")
    .Build();
```

## 🔍 Cấu Trúc Test Mẫu

```csharp
public class ServiceNameTests : IDisposable
{
    private readonly Mock<IDependency> _mockDependency;
    private readonly IService _service;

    public ServiceNameTests()
    {
        // Arrange - Setup mocks và service
        _mockDependency = new Mock<IDependency>();
        _service = new ServiceImplementation(_mockDependency.Object);
    }

    [Fact]
    public async Task MethodName_Scenario_ShouldExpectedResult()
    {
        // Arrange
        var input = CreateTestInput();
        var expectedOutput = CreateExpectedOutput();
        _mockDependency.Setup(x => x.Method()).ReturnsAsync(expectedOutput);

        // Act
        var result = await _service.MethodName(input);

        // Assert
        result.Should().BeEquivalentTo(expectedOutput);
        _mockDependency.Verify(x => x.Method(), Times.Once);
    }

    public void Dispose()
    {
        // Cleanup
    }
}
```

## 🎯 Best Practices Cho Testing

1. **AAA Pattern**: Arrange, Act, Assert
2. **Single Responsibility**: Một test cho một scenario
3. **Tên Mô Tả Rõ Ràng**: Tên method test rõ ràng
4. **Tests Độc Lập**: Không phụ thuộc giữa các tests
5. **Mock External Dependencies**: Tập trung vào unit đang test
6. **Sử Dụng Theory cho Nhiều Input**: Data-driven tests
7. **Test Edge Cases**: Null inputs, dữ liệu invalid, exceptions
8. **Verify Interactions**: Kiểm tra method calls với Verify()

## 📝 TODO: Thêm Các Test Files Khác

Tạo tests cho các components này:
- [ ] JobMatchingServiceTests (tests cho thuật toán matching)
- [ ] OrderServiceTests (tests cho workflow thanh toán)
- [ ] AuthControllerTests (tests cho authentication)
- [ ] JobControllerTests (tests cho CRUD job)
- [ ] Integration tests cho các workflow hoàn chỉnh