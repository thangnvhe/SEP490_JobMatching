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
import { CreateEditUserPage } from './pages/admin-site/ManageUser/CreateEditUser';
import { CreateEditJobPage } from './pages/admin-site/ManageJob/CreateEditJob';
import { CreateEditCompanyPage } from './pages/admin-site/ManageCompany/CreateEditCompany';
import { RecruiterLayout } from './components/layout/recruiter/RecruiterLayout';
import RecruiterDashboard from './pages/recruiter-site/Dashboard';
import { CandidateLayout } from './components/layout/candidate/CandidateLayout';
import CandidateDashboard from './pages/candidate-site/Dashboard';

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
        <Route path="manage-user/create" element={<CreateEditUserPage />} />
        <Route path="manage-user/edit/:id" element={<CreateEditUserPage />} />
        <Route path="manage-job/create" element={<CreateEditJobPage />} />
        <Route path="manage-job/edit/:id" element={<CreateEditJobPage />} />
        <Route path="manage-company/create" element={<CreateEditCompanyPage />} />
        <Route path="manage-company/edit/:id" element={<CreateEditCompanyPage />} />
        <Route path="test" element={<Hehe />} />
      </Route>

      {/* Recruiter routes */}
      <Route path="/recruiter" element={<RecruiterLayout />}>
        <Route index element={<RecruiterDashboard />} />
      </Route>

      {/* Candidate routes */}
      <Route path="/candidate" element={<CandidateLayout />}>
        <Route index element={<CandidateDashboard />} />
      </Route>

      {/* NotFound route - catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
