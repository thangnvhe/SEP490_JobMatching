import { Routes, Route } from 'react-router-dom';
import App from './App';

// Import các component trang
import HomePage from './pages/client-site/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

// Layouts
import { ClientLayout } from './components/layout/Client/ClientLayout';
import { AdminLayout } from './components/layout/Admin/AdminLayout';

// Admin pages
import DashboardPage from './pages/admin-site/Dashboard/DashboardPage';
import { ManageCompanyPage } from './pages/admin-site/ManageCompany/ViewCompanyList';
import { ManageUserPage } from './pages/admin-site/ManageUser/ViewUserList';
import { ManageJobPage } from './pages/admin-site/ManageJob/ViewJobList';
import { ManageReportPage } from './pages/admin-site/ManageReport/ViewReportList';
import Hehe from './pages/admin-site/Test/hehe';

// Component chính để render router
const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Client routes with ClientLayout */}
      <Route path="/" element={<App />}>
        <Route element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="manage-company" element={<ManageCompanyPage />} />
        <Route path="manage-user" element={<ManageUserPage />} />
        <Route path="manage-job" element={<ManageJobPage />} />
        <Route path="manage-report" element={<ManageReportPage />} />
        <Route path="test" element={<Hehe />} />
      </Route>

      {/* NotFound route - catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
