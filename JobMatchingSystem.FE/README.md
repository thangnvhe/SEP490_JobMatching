
# Job Matching System - Frontend

## 🚀 Setup dự án

**Yêu cầu:** Node.js 20.19+ hoặc 22.12+

1. Mở vào thư mục `JobMatchingSystem.FE`
2. Chạy `npm i` để cài đặt các thư viện cần thiết

## 📁 Cấu trúc dự án

```
JobMatchingSystem.FE/
├── 📁 src/                          # Source code chính
│   ├── 📁 components/               # UI Components
│   │   └── 📁 ui/                   # shadcn/ui components
│   ├── 📁 pages/                    # Các trang của ứng dụng
│   │   ├── 📁 Admin-Side/           # Trang quản trị
│   │   └── 📁 Client-Side/         # Trang người dùng
│   ├── 📁 store/                    # State management (Redux Toolkit)
│   │   └── 📁 slices/              # Redux slices
│   ├── 📁 services/                 # API services
│   ├── 📁 model/                    # TypeScript interfaces & types
│   ├── 📁 hooks/                    # Custom React hooks
│   ├── 📁 guard/                    # Route guards & authentication
│   ├── 📁 interceptor/              # Axios interceptors
│   ├── 📁 lib/                      # Utility functions
│   ├── App.tsx                      # Main App component
│   ├── app-router.tsx              # Router configuration
│   └── main.tsx                    # Entry point
├── 📁 public/                       # Static assets
├── 📁 node_modules/                 # Dependencies
├── package.json                     # Project dependencies
├── components.json                  # shadcn/ui configuration
├── vite.config.ts                   # Vite configuration
└── tsconfig.json                    # TypeScript configuration
```

### 🗂️ Chi tiết các thư mục

- **`src/components/`** - Tất cả UI components
  - **`ui/`** - shadcn/ui components (button, card, form, etc.)
- **`src/pages/`** - Các trang của ứng dụng
  - **`Admin-Side/`** - Giao diện quản trị
  - **`Client-Side/`** - Giao diện người dùng
- **`src/store/`** - Quản lý state toàn cục
  - **`slices/`** - Redux slices (auth, user, etc.)
- **`src/services/`** - Xử lý API calls và business logic
- **`src/model/`** - Định nghĩa TypeScript interfaces
- **`src/hooks/`** - Custom React hooks tái sử dụng
- **`src/guard/`** - Route protection và authentication
- **`src/interceptor/`** - Axios interceptors cho API
- **`src/lib/`** - Utility functions và helpers

## 🛠️ Công cụ phát triển

### IDE & Editor
- **Ưu tiên sử dụng Cursor** (không có thì mua)
- Cài đặt **MCP Server của shadcn** để AI hỗ trợ coding UI tốt hơn: [Hướng dẫn cài đặt](https://ui.shadcn.com/docs/mcp)

## 🎨 UI/UX Guidelines

### Client Side
- Xây dựng UI thoải mái, linh hoạt
- Kết hợp thư viện UI + tự viết components

### Admin Side  
- Xây dựng UI hoàn toàn dựa trên **shadcn/ui**
- Tập trung vào tính năng quản trị

## 📚 Thư viện chính

- **Form Validation:** [TanStack Form](https://tanstack.com/form/latest)
- **Table Management:** [TanStack Table](https://tanstack.com/table/v8)
- **UI Components:** shadcn/ui

## 🏗️ Kiến trúc Layout

Sau khi coding, cần tạo **Layout Admin** và **Layout Client** để:
- Đặt router vào layout tương ứng
- Thống nhất header, footer, sidebar cho từng loại người dùng
- Tách biệt giao diện quản trị và người dùng cuối