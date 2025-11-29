import { Routes, Route } from 'react-router-dom';
import App from './App';
import HomePage from './pages/client-site/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';
import JobsPage from './pages/client-site/guest/JobsPage';
import ContactRecruiterPage from './pages/client-site/guest/ContactRecruiterPage';
import { ClientLayout } from './components/layout/Client/ClientLayout';
import { ManageCompanyPage } from './pages/admin-site/ManageCompany/ViewCompanyList';
import ViewJobList from './pages/admin-site/ManageJob/ViewJobList';
import { CreateEditUserPage } from './pages/admin-site/ManageUser/CreateEditUser';
import RecruiterDashboard from './pages/client-site/recruiter/Dashboard';
import RecruiterViewJobList from './pages/client-site/recruiter/Jobs/ViewJobList';
import CreateJobPage from './pages/client-site/recruiter/Jobs/CreateJobPage';
import RecruitmentProcessManagement from './pages/client-site/recruiter/RecruitmentProcess/RecruitmentProcessManagement';
import CompanyProfile from './pages/client-site/recruiter/company/CompanyProfile';
import { CompanyMembersPage } from './pages/client-site/recruiter/company/CompanyMembersPage';
import CandidateDashboard from './pages/client-site/candidate/Dashboard';
import FavouriteJobsPage from './pages/client-site/candidate/FavouriteJobs';
import CVManagement from './pages/client-site/candidate/CVManagement';
import ProfileCvPage from './pages/client-site/candidate/profileCV/ProfileCVPage';
import PreviewDownloadCV from './pages/client-site/candidate/profileCV/PreviewDownloadCV';
import MyJobsPage from './pages/client-site/candidate/my-job/MyJobs';
import ViewUserList from './pages/admin-site/ManageUser/ViewUserList';
import ResetPasswordPage from './pages/client-site/auth/ResetPasswordPage';
import CompaniesPage from './pages/client-site/guest/CompaniesPage';
import CompanyDetailPage from './pages/client-site/guest/CompanyDetailPage';
import JobDetailPage from './pages/client-site/guest/JobDetailPage';
import { ConfirmEmailPage } from './pages/client-site/auth/ConfirmEmailPage';
import ViewReportList from './pages/admin-site/ManageReport/ViewReportList';
import { StageBoardDemo } from './components/Stage/StageBoardDemo';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Reset password route - Public */}
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Confirm email route - Public */}
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />

      <Route path="profile-cv/cv-templates" element={<PreviewDownloadCV />} />

      {/* Client routes with ClientLayout */}
      <Route path="/" element={<App />}>
        <Route element={<ClientLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/:id" element={<JobDetailPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/:id" element={<CompanyDetailPage />} />
          <Route path="contact-recruiter" element={<ContactRecruiterPage />} />
          <Route path="profile-cv" element={<ProfileCvPage />} />

        </Route>
      </Route>

      {/* Admin routes - Protected */}
      <Route path="/admin" element={<ClientLayout />}
      >
        <Route path="manage-user" element={<ViewUserList />} />
        <Route path="manage-company" element={<ManageCompanyPage />} />
        <Route path="manage-job" element={<ViewJobList />} />
        <Route path="manage-report" element={<ViewReportList />} />
        <Route path="manage-user/create" element={<CreateEditUserPage />} />
        <Route path="manage-user/edit/:id" element={<CreateEditUserPage />} />
      </Route>

      {/* Recruiter routes - Protected */}
      <Route path="/recruiter" element={<ClientLayout />}
      >
        <Route index element={<RecruiterDashboard />} />
        <Route path="jobs" element={<RecruiterViewJobList />} />
        <Route path="jobs/create" element={<CreateJobPage />} />
        <Route path="recruitment-process/:jobId" element={<RecruitmentProcessManagement />} />
        <Route path="company" element={<CompanyProfile />} />
        <Route path="company/members" element={<CompanyMembersPage />} />
        <Route path="stage-board" element={<StageBoardDemo />} />
      </Route>

      {/* Candidate routes - Protected */}
      <Route path="/candidate" element={<ClientLayout />}
      >
        <Route index element={<CandidateDashboard />} />
        <Route path="saved-jobs" element={<FavouriteJobsPage />} />
        <Route path="my-jobs" element={<MyJobsPage />} />
        <Route path="cv-management" element={<CVManagement />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRouter;
