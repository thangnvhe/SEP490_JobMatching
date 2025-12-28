@startuml
skinparam classAttributeIconSize 0

' ============ DTOs - REQUEST ============
class UpdateCurrentUserRequest {
    + FullName: string?
    + PhoneNumber: string?
    + Address: string?
    + Birthday: DateTime?
    + Gender: string?
    + AvatarFile: IFormFile?
}

class UpdateUserByAdminRequest {
    + FullName: string?
    + Email: string?
    + PhoneNumber: string?
    + Address: string?
    + Birthday: DateTime?
    + Gender: string?
    + AvatarFile: IFormFile?
    + IsActive: bool?
    + Role: string?
    + CompanyId: int?
}

class CreateHiringManagerRequest {
    + Email: string
    + FullName: string
    + PhoneNumber: string?
    + Address: string?
    + CompanyId: int
}

' ============ DTOs - RESPONSE ============
class UserDetailResponseDTO {
    + Id: int
    + FullName: string
    + Email: string
    + UserName: string
    + PhoneNumber: string
    + Address: string
    + AvatarUrl: string?
    + Gender: bool
    + Birthday: DateTime
    + IsActive: bool
    + Score: int?
    + CompanyId: int?
    + CreatedAt: DateTime
    + Role: string?
}

' ============ MODELS (ENTITIES) ============
class ApplicationUser {
    + Id: int
    + UserName: string
    + Email: string
    + FullName: string
    + AvatarUrl: string?
    + Gender: bool
    + Birthday: DateTime
    + Score: int?
    + IsActive: bool
    + CompanyId: int?
    + Address: string
    + RefreshToken: string?
    + RefreshTokenExpiryTime: DateTime?
    + PasswordResetToken: string?
    + PasswordResetTokenExpiry: DateTime?
    + PasswordResetTokenUsed: bool?
    + EmailConfirmationToken: string?
    + EmailConfirmationTokenUsed: bool?
    + SaveCVCount: int?
    + CreatedAt: DateTime
}

class Company {
    + Id: int
    + Name: string
}

class Job {
    + Id: int
    + Title: string
    + CreatedById: int
    + CreatedBy: ApplicationUser?
}

class JobQuota {
    + Id: int
    + UserId: int
}

' ============ CONTROLLER ============
class UserController {
    - _userService: IUserService
    - _logger: ILogger
    + GetAll(page, size, search, sortBy, isDecending, companyId, role, isActive): Task<IActionResult>
    + GetCurrentUser(): Task<IActionResult>
    + UpdateCurrentUser(request): Task<IActionResult>
    + GetUserById(id): Task<IActionResult>
    + ChangeStatus(id): Task<IActionResult>
    + UpdateUserByAdmin(id, request): Task<IActionResult>
    + CreateHiringManager(request): Task<IActionResult>
}

' ============ SERVICE LAYER ============
interface IUserService {
    + GetAllUser(page, size, search, sortBy, isDecending, companyId, role, status): Task<PagedResult<UserDetailResponseDTO>>
    + GetUserById(userId): Task<UserDetailResponseDTO>
    + ChangeStatus(userId): Task<void>
    + GetCurrentUser(userId): Task<UserDetailResponseDTO>
    + UpdateCurrentUser(userId, request): Task<UserDetailResponseDTO>
    + UpdateUserByAdmin(userId, request): Task<UserDetailResponseDTO>
    + CreateHiringManager(request): Task<UserDetailResponseDTO>
    + CleanupUserAvatarAsync(userId): Task<void>
}

class UserService {
    - _unitOfWork: IUnitOfWork
    - _mapper: IMapper
    - _webHostEnvironment: IWebHostEnvironment
    - _userManager: UserManager<ApplicationUser>
    - _roleManager: RoleManager<IdentityRole<int>>
    - _emailService: IEmailService
    - _blobStorageService: IBlobStorageService
    + GetAllUser(page, size, search, sortBy, isDecending, companyId, role, status): Task<PagedResult<UserDetailResponseDTO>>
    + GetUserById(userId): Task<UserDetailResponseDTO>
    + ChangeStatus(userId): Task<void>
    + GetCurrentUser(userId): Task<UserDetailResponseDTO>
    + UpdateCurrentUser(userId, request): Task<UserDetailResponseDTO>
    + UpdateUserByAdmin(userId, request): Task<UserDetailResponseDTO>
    + CreateHiringManager(request): Task<UserDetailResponseDTO>
    + CleanupUserAvatarAsync(userId): Task<void>
    - HandleRecruiterDeactivationAsync(userId): Task<void>
}

' ============ REPOSITORY LAYER ============
interface IAuthRepository {
    + GetUserByEmailAsync(email): Task<ApplicationUser?>
    + GetRolesAsync(user): Task<IList<string>>
    + UpdateUserAsync(user): Task<void>
    + GetUserByRefreshToken(refreshToken): Task<ApplicationUser?>
    + GetUserById(id): Task<ApplicationUser?>
    + ExistsAsync(email): Task<bool>
    + GetAllAsync(search, sortBy, isDecending, status): Task<List<ApplicationUser>>
    + GetUserRolesDictionaryAsync(userIds): Task<Dictionary<int, string>>
    + ChangeStatus(user): Task<void>
    + FindUserByCompanyId(companyId): Task<ApplicationUser?>
    + GetUsersByCompanyIdAsync(companyId): Task<List<ApplicationUser>>
}

class AuthRepository {
    - _userManager: UserManager<ApplicationUser>
    - _context: ApplicationDbContext
    + GetUserByEmailAsync(email): Task<ApplicationUser?>
    + GetRolesAsync(user): Task<IList<string>>
    + UpdateUserAsync(user): Task<void>
    + GetUserByRefreshToken(refreshToken): Task<ApplicationUser?>
    + GetUserById(id): Task<ApplicationUser?>
    + ExistsAsync(email): Task<bool>
    + GetAllAsync(search, sortBy, isDecending, status): Task<List<ApplicationUser>>
    + GetUserRolesDictionaryAsync(userIds): Task<Dictionary<int, string>>
    + ChangeStatus(user): Task<void>
    + FindUserByCompanyId(companyId): Task<ApplicationUser?>
    + GetUsersByCompanyIdAsync(companyId): Task<List<ApplicationUser>>
}

' ============ DATABASE CONTEXT ============
class ApplicationDbContext {
    + Users: DbSet<ApplicationUser>
    + UserRoles: DbSet<IdentityUserRole>
    + Roles: DbSet<IdentityRole>
    + Companies: DbSet<Company>
    + Jobs: DbSet<Job>
}

' ============ IDENTITY CLASSES ============
class IdentityUserRole<T> {
    + UserId: T
    + RoleId: T
}

class IdentityRole<T> {
    + Id: T
    + Name: string
}

class UserManager<T> {
}

class RoleManager<T> {
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

interface IEmailService {
    + SendEmailAsync(email, subject, body): Task<void>
}

interface IBlobStorageService {
    + GetSecureFileUrlAsync(fileName): Task<string>
    + UploadFileAsync(file): Task<string>
    + DeleteFileAsync(fileName): Task<void>
}

' ============ RELATIONSHIPS ============
UserController ..> IUserService : uses
IUserService <|.. UserService : implements

UserService ..> IAuthRepository : uses
UserService ..> ApplicationDbContext : uses
UserService ..> UserManager : uses
UserService ..> RoleManager : uses
UserService ..> IEmailService : uses
UserService ..> IBlobStorageService : uses

IAuthRepository <|.. AuthRepository : implements
AuthRepository --> ApplicationDbContext : queries
AuthRepository --> ApplicationUser : manages
AuthRepository --> IdentityUserRole : queries

UserController ..> UpdateCurrentUserRequest
UserController ..> UpdateUserByAdminRequest
UserController ..> CreateHiringManagerRequest
UserController ..> UserDetailResponseDTO
UserController ..> PagedResult : returns

UserService ..> UpdateCurrentUserRequest
UserService ..> UpdateUserByAdminRequest
UserService ..> CreateHiringManagerRequest
UserService ..> UserDetailResponseDTO
UserService --> ApplicationUser : returns/manages

ApplicationUser --> Company : references
ApplicationUser --> Job : has many (CreatedJobs)
ApplicationUser --> Job : has many (AdminJobs)
ApplicationUser --> JobQuota : has one

ApplicationDbContext --> ApplicationUser : manages
ApplicationDbContext --> IdentityUserRole : manages
ApplicationDbContext --> Company : manages
ApplicationDbContext --> Job : manages

PagedResult --> PageInfo : contains
PagedResult --> UserDetailResponseDTO : contains

@enduml
