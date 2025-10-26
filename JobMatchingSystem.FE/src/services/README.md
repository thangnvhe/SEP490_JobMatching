# Services Layer

Thư mục này chứa các service để quản lý API calls trong ứng dụng.

## Cấu trúc

```
services/
├── index.ts           # Export tất cả services
├── types.ts           # TypeScript types cho API
├── authService.ts     # Service cho authentication
├── userService.ts     # Service cho user management
├── jobService.ts      # Service cho job management
├── companyService.ts  # Service cho company management
└── README.md          # Tài liệu này
```

## Cách sử dụng

### 1. AuthService

Service chính để xử lý authentication:

```typescript
import { authService } from '@/services/authService';

// Đăng nhập
const loginData = {
  username: 'user123',
  password: 'password123',
  rememberMe: true
};
const response = await authService.login(loginData);

// Đăng ký
const registerData = {
  firstName: 'John',
  lastName: 'Doe',
  username: 'johndoe',
  email: 'john@example.com',
  password: 'password123',
  confirmPassword: 'password123'
};
const response = await authService.register(registerData);

// Đăng xuất
await authService.logout();

// Kiểm tra trạng thái đăng nhập
const isLoggedIn = authService.isAuthenticated();

// Lấy thông tin user hiện tại
const user = await authService.getCurrentUser();
```

### 2. Redux Integration

Sử dụng Redux actions trong components:

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { login, logout, clearError } from '@/store/slices/authSlice';

function MyComponent() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = async () => {
    try {
      await dispatch(login(loginData)).unwrap();
      // Login successful
    } catch (error) {
      // Handle error
    }
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      // Logout successful
    } catch (error) {
      // Handle error
    }
  };
}
```

### 3. Error Handling

Tất cả services đều có error handling tích hợp:

```typescript
try {
  const response = await authService.login(loginData);
  // Success
} catch (error) {
  // Error object có các properties:
  // - message: string (thông báo lỗi)
  // - status: number (HTTP status code)
  // - errors: string[] (chi tiết lỗi validation)
  console.error('Login failed:', error.message);
}
```

### 4. Axios Interceptor

Axios interceptor đã được cấu hình để:
- Tự động thêm Authorization header
- Xử lý refresh token khi access token hết hạn
- Retry request sau khi refresh token thành công

## API Endpoints

### Authentication
- `POST /auth/login` - Đăng nhập
- `POST /auth/register` - Đăng ký
- `POST /auth/logout` - Đăng xuất
- `POST /auth/refresh-token` - Refresh token
- `POST /auth/forgot-password` - Quên mật khẩu
- `POST /auth/reset-password` - Đặt lại mật khẩu
- `GET /auth/me` - Lấy thông tin user hiện tại

### Users
- `GET /users` - Lấy danh sách users
- `GET /users/:id` - Lấy thông tin user theo ID
- `PUT /users/:id` - Cập nhật user
- `DELETE /users/:id` - Xóa user
- `PATCH /users/:id/status` - Thay đổi trạng thái user

### Jobs
- `GET /jobs` - Lấy danh sách jobs
- `GET /jobs/:id` - Lấy thông tin job theo ID
- `POST /jobs` - Tạo job mới
- `PUT /jobs/:id` - Cập nhật job
- `DELETE /jobs/:id` - Xóa job
- `POST /jobs/:id/apply` - Ứng tuyển job
- `POST /jobs/:id/save` - Lưu job
- `DELETE /jobs/:id/save` - Bỏ lưu job
- `GET /jobs/saved` - Lấy danh sách jobs đã lưu

### Companies
- `GET /companies` - Lấy danh sách companies
- `GET /companies/:id` - Lấy thông tin company theo ID
- `POST /companies` - Tạo company mới
- `PUT /companies/:id` - Cập nhật company
- `DELETE /companies/:id` - Xóa company
- `PATCH /companies/:id/status` - Thay đổi trạng thái company
- `GET /companies/:id/jobs` - Lấy danh sách jobs của company

## Environment Variables

Đảm bảo có biến môi trường `VITE_API_URL` trong file `.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

## Lưu ý

1. Tất cả API calls đều sử dụng axios instance đã được cấu hình
2. Token được lưu trong localStorage hoặc sessionStorage tùy theo lựa chọn "Remember me"
3. Error handling được xử lý tự động và hiển thị toast notification
4. Loading states được quản lý bởi Redux store
5. Refresh token được xử lý tự động khi access token hết hạn
