# RoleGuard - Hướng dẫn sử dụng

## Giới thiệu

`RoleGuard` là một component React dùng để kiểm tra quyền truy cập dựa trên role của user. Role được lấy từ global state (Redux store).

## Import

```tsx
import RoleGuard, { 
  useHasRole, 
  useCurrentRole,
  useIsGuest,
  useIsAuthenticated
} from '@/guards/RoleGuard';
```

---

## 1. Component RoleGuard

### Props

| Prop | Type | Mặc định | Mô tả |
|------|------|----------|-------|
| `allowedRoles` | `ExtendedRole \| ExtendedRole[]` | **Bắt buộc** | Role hoặc mảng các role được phép xem |
| `children` | `ReactNode` | **Bắt buộc** | Nội dung hiển thị khi có quyền |
| `fallback` | `ReactNode` | `null` | Nội dung hiển thị khi không có quyền |

### Các Role có sẵn

```typescript
// UserRole - các role của user đã đăng nhập
type UserRole = "Admin" | "Recruiter" | "Candidate" | "Hiringmanager";

// ExtendedRole - bao gồm cả Guest cho người chưa đăng nhập
type ExtendedRole = UserRole | "Guest";
```

> **Lưu ý:** RoleGuard tự động chuẩn hóa role thành viết hoa chữ cái đầu, nên bạn có thể dùng `"admin"`, `"Admin"`, hay `"ADMIN"` đều được.

---

## 2. Các trường hợp sử dụng

### Chỉ Admin mới thấy

```tsx
<RoleGuard allowedRoles="Admin">
  <button>Xóa tất cả dữ liệu</button>
</RoleGuard>
```

### Nhiều role được phép

```tsx
<RoleGuard allowedRoles={['Admin', 'Recruiter']}>
  <button>Quản lý công việc</button>
</RoleGuard>
```

### Chỉ Guest (chưa đăng nhập) mới thấy

```tsx
<RoleGuard allowedRoles="Guest">
  <Link to="/contact-recruiter">Nhà tuyển dụng</Link>
</RoleGuard>
```

### Guest hoặc Candidate thấy

```tsx
<RoleGuard allowedRoles={['Guest', 'Candidate']}>
  <PublicContent />
</RoleGuard>
```

### Với fallback content

```tsx
<RoleGuard 
  allowedRoles="Admin" 
  fallback={<p className="text-red-500">Bạn không có quyền truy cập</p>}
>
  <AdminDashboard />
</RoleGuard>
```

---

## 3. Hooks

### useHasRole

Kiểm tra user có role cụ thể không.

```tsx
const MyComponent = () => {
  const isAdmin = useHasRole('Admin');
  const isAdminOrRecruiter = useHasRole(['Admin', 'Recruiter']);
  const isGuest = useHasRole('Guest');

  return (
    <div>
      {isAdmin && <AdminBadge />}
      {isAdminOrRecruiter && <ManageButton />}
      {isGuest && <LoginPrompt />}
    </div>
  );
};
```

### useCurrentRole

Lấy role hiện tại của user.

```tsx
const MyComponent = () => {
  const currentRole = useCurrentRole();

  return (
    <div>
      {currentRole === 'Admin' && <AdminDashboard />}
      {currentRole === 'Recruiter' && <RecruiterDashboard />}
      {currentRole === 'Candidate' && <CandidateDashboard />}
      {currentRole === 'Guest' && <GuestView />}
    </div>
  );
};
```

### useIsGuest

Kiểm tra user có phải guest (chưa đăng nhập) không.

```tsx
const MyComponent = () => {
  const isGuest = useIsGuest();

  return isGuest ? <LoginButton /> : <UserMenu />;
};
```

### useIsAuthenticated

Kiểm tra user đã đăng nhập chưa.

```tsx
const MyComponent = () => {
  const isAuthenticated = useIsAuthenticated();

  return isAuthenticated ? <Dashboard /> : <LandingPage />;
};
```

---

## 4. Ví dụ thực tế

### Ẩn/hiện button trong bảng

```tsx
const ActionColumn = ({ record }) => (
  <div className="flex gap-2">
    {/* Mọi người đều thấy */}
    <Button onClick={() => handleView(record)}>Xem</Button>

    {/* Chỉ Admin và Recruiter thấy */}
    <RoleGuard allowedRoles={['Admin', 'Recruiter']}>
      <Button onClick={() => handleEdit(record)}>Sửa</Button>
    </RoleGuard>

    {/* Chỉ Admin thấy */}
    <RoleGuard allowedRoles="Admin">
      <Button variant="destructive" onClick={() => handleDelete(record)}>
        Xóa
      </Button>
    </RoleGuard>
  </div>
);
```

### Menu navigation có điều kiện

```tsx
const Sidebar = () => (
  <nav>
    <NavItem to="/">Trang chủ</NavItem>
    
    <RoleGuard allowedRoles="Admin">
      <NavItem to="/admin">Quản trị</NavItem>
      <NavItem to="/admin/users">Quản lý User</NavItem>
    </RoleGuard>

    <RoleGuard allowedRoles="Recruiter">
      <NavItem to="/recruiter">Dashboard Recruiter</NavItem>
      <NavItem to="/recruiter/jobs">Việc làm của tôi</NavItem>
    </RoleGuard>

    <RoleGuard allowedRoles="Candidate">
      <NavItem to="/candidate">Dashboard Ứng viên</NavItem>
      <NavItem to="/candidate/applications">Đơn ứng tuyển</NavItem>
    </RoleGuard>

    {/* Chỉ Guest thấy */}
    <RoleGuard allowedRoles="Guest">
      <NavItem to="/contact-recruiter">Nhà tuyển dụng</NavItem>
    </RoleGuard>
  </nav>
);
```

### Header với các link theo role

```tsx
const Header = () => (
  <header>
    <nav>
      <Link to="/">Trang Chủ</Link>
      <Link to="/jobs">Tìm Kiếm Công Việc</Link>
      
      {/* Chỉ Recruiter thấy */}
      <RoleGuard allowedRoles="Recruiter">
        <Link to="/pricing">Bảng Giá</Link>
      </RoleGuard>
      
      {/* Chỉ Guest thấy */}
      <RoleGuard allowedRoles="Guest">
        <Link to="/contact-recruiter">Nhà tuyển dụng</Link>
      </RoleGuard>
    </nav>
  </header>
);
```

### Kết hợp với conditional rendering khác

```tsx
const JobCard = ({ job }) => {
  const isOwner = job.recruiterId === currentUserId;
  const isAdmin = useHasRole('Admin');

  return (
    <Card>
      <CardContent>
        <h3>{job.title}</h3>
        
        {/* Hiển thị nếu là Admin HOẶC là người tạo job */}
        {(isAdmin || isOwner) && (
          <Button onClick={() => handleEdit(job)}>Chỉnh sửa</Button>
        )}

        {/* Chỉ Admin mới xóa được */}
        <RoleGuard allowedRoles="Admin">
          <Button variant="destructive">Xóa vĩnh viễn</Button>
        </RoleGuard>
      </CardContent>
    </Card>
  );
};
```

---

## 5. Bảng tóm tắt allowedRoles

| allowedRoles | Ai thấy? |
|--------------|----------|
| `"Admin"` | Chỉ Admin |
| `"Recruiter"` | Chỉ Recruiter |
| `"Candidate"` | Chỉ Candidate |
| `"Hiringmanager"` | Chỉ Hiring Manager |
| `"Guest"` | Chỉ người chưa đăng nhập |
| `["Admin", "Recruiter"]` | Admin hoặc Recruiter |
| `["Guest", "Candidate"]` | Guest hoặc Candidate |
| `["Admin", "Recruiter", "Hiringmanager"]` | Admin, Recruiter hoặc Hiring Manager |

---

## 6. Lưu ý

1. **Role được lấy từ Redux store** (`state.authState.role`), đảm bảo user đã đăng nhập và role được set đúng.

2. **Case-insensitive** - Role được tự động chuẩn hóa thành viết hoa chữ cái đầu. Bạn có thể dùng `"admin"`, `"Admin"`, hay `"ADMIN"` đều hoạt động như nhau.

3. **"Guest" là role đặc biệt** - Dùng để cho phép người chưa đăng nhập xem nội dung.

4. **Fallback là optional** - Nếu không cung cấp fallback, component sẽ không render gì khi không có quyền.

5. **Không thay thế AuthGuard** - `RoleGuard` chỉ dùng để ẩn/hiện UI elements. Để bảo vệ routes, vẫn nên dùng `AuthGuard` ở level routing.
