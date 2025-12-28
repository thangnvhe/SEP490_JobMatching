@startuml
skinparam classAttributeIconSize 0

' ============ DTOs - REQUEST ============
class CreateTaxonomyRequest {
    + Name: string
    + ParentId: int?
}

class UpdateTaxonomyRequest {
    + Name: string
}

' ============ DTOs - RESPONSE ============
class TaxonomyResponse {
    + Id: int
    + Name: string
    + ChildrenIds: int[]
    + HasChildren: bool?
}

' ============ MODELS (ENTITIES) ============
class Taxonomy {
    + Id: int
    + Name: string
    + ParentId: int?
    + Parent: Taxonomy?
    + Children: ICollection<Taxonomy>
    + CandidateTaxonomies: ICollection<CandidateTaxonomy>
    + JobTaxonomies: ICollection<JobTaxonomy>
}

class CandidateTaxonomy {
    + Id: int
    + CandidateId: int
    + TaxonomyId: int
}

class JobTaxonomy {
    + Id: int
    + JobId: int
    + TaxonomyId: int
}

' ============ CONTROLLER ============
class TaxonomyController {
    - _taxonomyService: ITaxonomyService
    + GetAll(): Task<IActionResult>
    + GetAllPaged(page, pageSize, sortBy, isDescending, search, hasParent): Task<IActionResult>
    + GetById(id): Task<IActionResult>
    + GetChildrenByParentId(parentId): Task<IActionResult>
    + Create(request): Task<IActionResult>
    + Update(id, request): Task<IActionResult>
    + Delete(id): Task<IActionResult>
}

' ============ SERVICE LAYER ============
interface ITaxonomyService {
    + GetAllTaxonomiesAsync(): Task<IEnumerable<TaxonomyResponse>>
    + GetAllPagedAsync(page, pageSize, sortBy, isDescending, search, hasParent): Task<PagedResult<TaxonomyResponse>>
    + GetByIdAsync(id): Task<TaxonomyResponse?>
    + GetChildrenByParentIdAsync(parentId): Task<IEnumerable<TaxonomyResponse>>
    + CreateTaxonomyAsync(request): Task<Taxonomy>
    + UpdateTaxonomyAsync(id, request): Task<Taxonomy>
    + DeleteTaxonomyAsync(id): Task<void>
}

class TaxonomyService {
    - _taxonomyRepository: ITaxonomyRepository
    + GetAllTaxonomiesAsync(): Task<IEnumerable<TaxonomyResponse>>
    + GetAllPagedAsync(page, pageSize, sortBy, isDescending, search, hasParent): Task<PagedResult<TaxonomyResponse>>
    + GetByIdAsync(id): Task<TaxonomyResponse?>
    + GetChildrenByParentIdAsync(parentId): Task<IEnumerable<TaxonomyResponse>>
    + CreateTaxonomyAsync(request): Task<Taxonomy>
    + UpdateTaxonomyAsync(id, request): Task<Taxonomy>
    + DeleteTaxonomyAsync(id): Task<void>
}

' ============ REPOSITORY LAYER ============
interface ITaxonomyRepository {
    + GetAllAsync(): Task<List<Taxonomy>>
    + GetQueryable(): IQueryable<Taxonomy>
    + GetAllWithChildrenAsync(): Task<List<Taxonomy>>
    + GetAllWithParentAsync(): Task<List<Taxonomy>>
    + GetChildrenByParentIdAsync(parentId): Task<List<Taxonomy>>
    + GetByIdAsync(id): Task<Taxonomy?>
    + GetRootTaxonomiesAsync(): Task<List<Taxonomy>>
    + ExistsByNameAndParentAsync(name, parentId, excludeId): Task<bool>
    + CreateAsync(taxonomy): Task<Taxonomy>
    + UpdateAsync(taxonomy): Task<Taxonomy>
    + DeleteAsync(id): Task<void>
}

class TaxonomyRepository {
    - _context: ApplicationDbContext
    + GetAllAsync(): Task<List<Taxonomy>>
    + GetQueryable(): IQueryable<Taxonomy>
    + GetAllWithChildrenAsync(): Task<List<Taxonomy>>
    + GetAllWithParentAsync(): Task<List<Taxonomy>>
    + GetChildrenByParentIdAsync(parentId): Task<List<Taxonomy>>
    + GetByIdAsync(id): Task<Taxonomy?>
    + GetRootTaxonomiesAsync(): Task<List<Taxonomy>>
    + ExistsByNameAndParentAsync(name, parentId, excludeId): Task<bool>
    + CreateAsync(taxonomy): Task<Taxonomy>
    + UpdateAsync(taxonomy): Task<Taxonomy>
    + DeleteAsync(id): Task<void>
}

' ============ DATABASE CONTEXT ============
class ApplicationDbContext {
    + Taxonomies: DbSet<Taxonomy>
    + CandidateTaxonomies: DbSet<CandidateTaxonomy>
    + JobTaxonomies: DbSet<JobTaxonomy>
}

' ============ HELPER CLASSES ============
class PageInfo {
    + TotalCount: int
    + Page: int
    + PageSize: int
    + SortBy: string
    + IsDescending: bool
}

class PagedResult<T> {
    + Items: List<T>
    + pageInfo: PageInfo
}

' ============ RELATIONSHIPS ============
TaxonomyController ..> ITaxonomyService : uses
ITaxonomyService <|.. TaxonomyService : implements
TaxonomyService ..> ITaxonomyRepository : uses
ITaxonomyRepository <|.. TaxonomyRepository : implements
TaxonomyRepository --> ApplicationDbContext : queries
TaxonomyRepository --> Taxonomy : manages

TaxonomyController ..> CreateTaxonomyRequest
TaxonomyController ..> UpdateTaxonomyRequest
TaxonomyController ..> TaxonomyResponse
TaxonomyController ..> PagedResult : returns

TaxonomyService ..> CreateTaxonomyRequest
TaxonomyService ..> UpdateTaxonomyRequest
TaxonomyService ..> TaxonomyResponse
TaxonomyService --> Taxonomy : returns

Taxonomy --> Taxonomy : Parent/Children
Taxonomy --> CandidateTaxonomy : has many
Taxonomy --> JobTaxonomy : has many

ApplicationDbContext --> Taxonomy : manages
ApplicationDbContext --> CandidateTaxonomy : manages
ApplicationDbContext --> JobTaxonomy : manages

PagedResult --> PageInfo : contains
PagedResult --> TaxonomyResponse : contains

@enduml
