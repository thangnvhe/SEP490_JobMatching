import { Routes, Route } from 'react-router-dom';
import App from './App';
// Import các component trang
import HomePage from './pages/client-site/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import JobsPage from './pages/client-site/guest/JobsPage';
// import JobDetailPage from './pages/client-site/guest/JobDetailPage';
import ContactRecruiterPage from './pages/client-site/guest/ContactRecruiterPage';
import { ClientLayout } from './components/layout/Client/ClientLayout';
// Admin pages
import { ManageCompanyPage } from './pages/admin-site/ManageCompany/ViewCompanyList';
import ViewJobList from './pages/admin-site/ManageJob/ViewJobList';
import { ManageReportPage } from './pages/admin-site/ManageReport/ViewReportList';
import { CreateEditUserPage } from './pages/admin-site/ManageUser/CreateEditUser';
import { CreateEditJobPage } from './pages/admin-site/ManageJob/CreateEditJob';
import { CreateEditCompanyPage } from './pages/admin-site/ManageCompany/CreateEditCompany';
import RecruiterDashboard from './pages/client-site/recruiter/Dashboard';
import CandidateDashboard from './pages/client-site/candidate/Dashboard';
import FavouriteJobsPage from './pages/client-site/candidate/FavouriteJobs';
import ProfilePage from './pages/client-site/profile/profile';
import ViewUserList from './pages/admin-site/ManageUser/ViewUserList';
import ResetPasswordPage from './pages/client-site/auth/ResetPasswordPage';

// Component chính để render router
const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Reset password route - Public */}
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Client routes with ClientLayout */}
      <Route path="/" element={<App />}>
        <Route element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="jobs" element={<JobsPage />} />
          {/* <Route path="jobs/:id" element={<JobDetailPage />} /> */}
          {/* <Route path="companies" element={<CompaniesPage />} /> */}
          {/* <Route path="companies/:id" element={<CompanyDetailPage />} /> */}
          <Route path="contact-recruiter" element={<ContactRecruiterPage />} />
          <Route path="profile" element={<ProfilePage />} />

        </Route>
      </Route>

      {/* Admin routes - Protected */}
      <Route
        path="/admin"
        element={
          <ClientLayout />
        }
      >
        <Route path="manage-user" element={<ViewUserList />} />
        <Route path="manage-company" element={<ManageCompanyPage />} />
        <Route path="manage-job" element={<ViewJobList />} />
        <Route path="manage-report" element={<ManageReportPage />} />
        <Route path="manage-user/create" element={<CreateEditUserPage />} />
        <Route path="manage-user/edit/:id" element={<CreateEditUserPage />} />
        <Route path="manage-job/create" element={<CreateEditJobPage />} />
        <Route path="manage-job/edit/:id" element={<CreateEditJobPage />} />
        <Route path="manage-company/create" element={<CreateEditCompanyPage />} />
        <Route path="manage-company/edit/:id" element={<CreateEditCompanyPage />} />
      </Route>

      {/* Recruiter routes - Protected */}
      <Route
        path="/recruiter"
        element={
          <ClientLayout />
        }
      >
        <Route index element={<RecruiterDashboard />} />
      </Route>

      {/* Candidate routes - Protected */}
      <Route
        path="/candidate"
        element={
          <ClientLayout />
        }
      >
        <Route index element={<CandidateDashboard />} />
        <Route path="saved-jobs" element={<FavouriteJobsPage />} />
      </Route>

      {/* NotFound route - catch all */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
