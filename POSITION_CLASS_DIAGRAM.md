@startuml
skinparam classAttributeIconSize 0

' ============ DTOs - REQUEST ============
class CreatePositionRequest {
    + Name: string
}

class UpdatePositionRequest {
    + Name: string
}

' ============ DTOs - RESPONSE ============
class PositionResponse {
    + PositionId: int
    + Name: string
}

' ============ MODELS (ENTITIES) ============
class Position {
    + PositionId: int
    + Name: string
    + Jobs: ICollection<Job>
    + CVProfiles: ICollection<CVProfile>
}

class Job {
    + Id: int
    + Title: string
    + PositionId: int?
    + Position: Position?
}

class CVProfile {
    + Id: int
    + FullName: string
    + PositionId: int?
    + Position: Position?
}

' ============ CONTROLLER ============
class PositionController {
    - _positionService: IPositionService
    + GetAll(): Task<IActionResult>
    + GetAllPaged(page, pageSize, sortBy, isDescending, search): Task<IActionResult>
    + GetById(id): Task<IActionResult>
    + Create(request): Task<IActionResult>
    + Update(id, request): Task<IActionResult>
    + Delete(id): Task<IActionResult>
}

' ============ SERVICE LAYER ============
interface IPositionService {
    + GetAllAsync(): Task<IEnumerable<PositionResponse>>
    + GetAllPagedAsync(page, pageSize, sortBy, isDescending, search): Task<PagedResult<PositionResponse>>
    + GetByIdAsync(id): Task<PositionResponse>
    + CreatePositionAsync(request): Task<Position>
    + UpdatePositionAsync(id, request): Task<Position>
    + DeletePositionAsync(id): Task<void>
}

class PositionService {
    - _positionRepository: IPositionRepository
    - _userManager: UserManager<ApplicationUser>
    - _context: ApplicationDbContext
    + GetAllAsync(): Task<IEnumerable<PositionResponse>>
    + GetAllPagedAsync(page, pageSize, sortBy, isDescending, search): Task<PagedResult<PositionResponse>>
    + GetByIdAsync(id): Task<PositionResponse>
    + CreatePositionAsync(request): Task<Position>
    + UpdatePositionAsync(id, request): Task<Position>
    + DeletePositionAsync(id): Task<void>
}

' ============ REPOSITORY LAYER ============
interface IPositionRepository {
    + GetAllAsync(): Task<IEnumerable<Position>>
    + GetByIdAsync(id): Task<Position?>
    + CreateAsync(position): Task<Position>
    + UpdateAsync(position): Task<Position>
    + DeleteAsync(id): Task<void>
}

class PositionRepository {
    - _context: ApplicationDbContext
    + GetAllAsync(): Task<IEnumerable<Position>>
    + GetByIdAsync(id): Task<Position?>
    + CreateAsync(position): Task<Position>
    + UpdateAsync(position): Task<Position>
    + DeleteAsync(id): Task<void>
}

' ============ DATABASE CONTEXT ============
class ApplicationDbContext {
    + Positions: DbSet<Position>
    + Jobs: DbSet<Job>
    + CVProfiles: DbSet<CVProfile>
}

class ApplicationUser {
    + Id: int
    + Email: string
    + FullName: string
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

class UserManager<T> {
}

' ============ RELATIONSHIPS ============
PositionController ..> IPositionService : uses
IPositionService <|.. PositionService : implements
PositionService ..> IPositionRepository : uses
PositionService ..> ApplicationDbContext : uses
PositionService ..> ApplicationUser : uses

IPositionRepository <|.. PositionRepository : implements
PositionRepository --> ApplicationDbContext : queries
PositionRepository --> Position : manages

PositionController ..> CreatePositionRequest
PositionController ..> UpdatePositionRequest
PositionController ..> PositionResponse
PositionController ..> PagedResult : returns

PositionService ..> CreatePositionRequest
PositionService ..> UpdatePositionRequest
PositionService ..> PositionResponse
PositionService --> Position : returns

Position --> Job : has many
Position --> CVProfile : has many

ApplicationDbContext --> Position : manages
ApplicationDbContext --> Job : manages
ApplicationDbContext --> CVProfile : manages
ApplicationDbContext --> ApplicationUser : manages

PagedResult --> PageInfo : contains
PagedResult --> PositionResponse : contains

@enduml
