import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

// Import các component trang (sẽ tạo sau)
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
// Admin Layout và Dashboard
import AdminLayout from "./components/layout/AdminLayout";
import DashboardPage from "./pages/admin-site/DashboardPage";
// Cấu hình router
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <AboutPage />,
      },
    ],
    errorElement: <NotFoundPage />,
  },
  {
    path: "/admin",
    element: <AdminLayout />, // Sử dụng AdminLayout làm vỏ bọc
    errorElement: <NotFoundPage />, 
    children: [
      {
        index: true, 
        element: <DashboardPage />,
      },
      // Ví dụ: sau này bạn thêm trang quản lý người dùng
      // {
      //   path: 'users',
      //   element: <UserManagementPage />,
      // },
    ],
  },
]);

// Component chính để render router
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
