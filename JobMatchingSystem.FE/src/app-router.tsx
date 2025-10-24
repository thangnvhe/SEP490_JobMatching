import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';

// Import các component trang (sẽ tạo sau)
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
// Admin Layout và Dashboard
import { AdminLayout } from './components/layout/Admin/AdminLayout';
import { DashboardPage } from './pages/admin-site/Dashboard/DashboardPage';
import { ManageCompanyPage } from "./pages/admin-site/ManageCompany/ViewCompanyList";
import { ManageUserPage } from './pages/admin-site/ManageUser/ViewUserList';
import { ManageJobPage } from './pages/admin-site/ManageJob/ViewJobList';
import { ManageReportPage } from './pages/admin-site/ManageReport/ViewReportList';
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
      {
        path: "manage-company", // path: /admin/manage-company
        element: <ManageCompanyPage />,
      },
      {
        path: "manage-user", // path: /admin/manage-user
        element: <ManageUserPage />,
      },
      {
        path: "manage-job", // path: /admin/manage-job
        element: <ManageJobPage />,
      },
      {
        path: "manage-report", // path: /admin/manage-report
        element: <ManageReportPage />,
      },
    ],
  },
]);

// Component chính để render router
const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
