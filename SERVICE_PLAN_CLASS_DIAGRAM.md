@startuml
skinparam classAttributeIconSize 0

' ============ DTOs - REQUEST ============
class CreateServicePlanRequest {
    + Name: string
    + Description: string
    + Price: decimal
    + JobPostAdditional: int?
    + HighlightJobDays: int?
    + HighlightJobDaysCount: int?
    + ExtensionJobDays: int?
    + ExtensionJobDaysCount: int?
    + CVSaveAdditional: int?
}

class UpdateServicePlanRequest {
    + Name: string?
    + Description: string?
    + Price: decimal?
    + JobPostAdditional: int?
    + HighlightJobDays: int?
    + HighlightJobDaysCount: int?
    + ExtensionJobDays: int?
    + ExtensionJobDaysCount: int?
    + CVSaveAdditional: int?
}

' ============ DTOs - RESPONSE ============
class ServicePlanResponse {
    + Id: int
    + Name: string
    + Description: string
    + Price: decimal
    + JobPostAdditional: int?
    + HighlightJobDays: int?
    + HighlightJobDaysCount: int?
    + ExtensionJobDays: int?
    + ExtensionJobDaysCount: int?
    + CVSaveAdditional: int?
}

' ============ MODELS (ENTITIES) ============
class ServicePlan {
    + Id: int
    + Name: string
    + Description: string
    + Price: decimal
    + JobPostAdditional: int?
    + HighlightJobDays: int?
    + HighlightJobDaysCount: int?
    + ExtensionJobDays: int?
    + ExtensionJobDaysCount: int?
    + CVSaveAdditional: int?
    + Orders: ICollection<Order>
}

class Order {
    + Id: int
    + BuyerId: int
    + ServiceId: int
    + Amount: decimal
    + Status: OrderStatus
    + TransferContent: string
    + CreatedAt: DateTime
}

' ============ CONTROLLER ============
class ServicePlanController {
    - _servicePlanService: IServicePlanService
    + GetAllNoPaging(): Task<IActionResult>
    + GetAll(page, pageSize, sortBy, isDescending, search): Task<IActionResult>
    + GetById(id): Task<IActionResult>
    + Create(request): Task<IActionResult>
    + Update(id, request): Task<IActionResult>
    + Delete(id): Task<IActionResult>
}

' ============ SERVICE LAYER ============
interface IServicePlanService {
    + GetAllAsync(): Task<List<ServicePlanResponse>>
    + GetByIdAsync(id): Task<ServicePlanResponse>
    + CreateAsync(request): Task<void>
    + UpdateAsync(id, request): Task<void>
    + DeleteAsync(id): Task<void>
}

class ServicePlanService {
    - _servicePlanRepository: IServicePlanRepository
    + GetAllAsync(): Task<List<ServicePlanResponse>>
    + GetByIdAsync(id): Task<ServicePlanResponse>
    + CreateAsync(request): Task<void>
    + UpdateAsync(id, request): Task<void>
    + DeleteAsync(id): Task<void>
}

' ============ REPOSITORY LAYER ============
interface IServicePlanRepository {
    + GetAllAsync(): Task<List<ServicePlan>>
    + GetByIdAsync(id): Task<ServicePlan?>
    + AddAsync(plan): Task<void>
    + UpdateAsync(plan): Task<void>
    + DeleteAsync(plan): Task<void>
}

class ServicePlanRepository {
    - _context: ApplicationDbContext
    + GetAllAsync(): Task<List<ServicePlan>>
    + GetByIdAsync(id): Task<ServicePlan?>
    + AddAsync(plan): Task<void>
    + UpdateAsync(plan): Task<void>
    + DeleteAsync(plan): Task<void>
}

' ============ DATABASE CONTEXT ============
class ApplicationDbContext {
    + ServicePlans: DbSet<ServicePlan>
    + Orders: DbSet<Order>
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
ServicePlanController ..> IServicePlanService : uses
IServicePlanService <|.. ServicePlanService : implements
ServicePlanService ..> IServicePlanRepository : uses
IServicePlanRepository <|.. ServicePlanRepository : implements
ServicePlanRepository --> ApplicationDbContext : queries
ServicePlanRepository --> ServicePlan : manages

ServicePlanController ..> CreateServicePlanRequest
ServicePlanController ..> UpdateServicePlanRequest
ServicePlanController ..> ServicePlanResponse
ServicePlanController ..> PagedResult : returns

ServicePlanService ..> CreateServicePlanRequest
ServicePlanService ..> UpdateServicePlanRequest
ServicePlanService ..> ServicePlanResponse
ServicePlanService --> ServicePlan : returns

ServicePlan --> Order : has many

ApplicationDbContext --> ServicePlan : manages
ApplicationDbContext --> Order : manages

PagedResult --> PageInfo : contains
PagedResult --> ServicePlanResponse : contains

@enduml
