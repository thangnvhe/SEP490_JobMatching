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
import RecruiterDashboard from './pages/client-site/recruiter/Dashboard';
import RecruiterViewJobList from './pages/client-site/recruiter/Jobs/ViewJobList';
import CreateJobPage from './pages/client-site/recruiter/Jobs/CreateJobPage';
import RecruitmentProcessManagement from './pages/client-site/recruiter/RecruitmentProcess/RecruitmentProcessManagement';
import CompanyProfile from './pages/client-site/recruiter/company/CompanyProfile';
import { CompanyMembersPage } from './pages/client-site/recruiter/company/CompanyMembersPage';
import ViewServicePackageList from './pages/client-site/recruiter/service-package/ViewServicePackageList';
import CandidateDashboard from './pages/client-site/candidate/Dashboard';
import FavouriteJobsPage from './pages/client-site/candidate/FavouriteJobs';
import CVManagement from './pages/client-site/candidate/CVManagement';
import ProfileCvPage from './pages/client-site/candidate/profileCV/ProfileCVPage';
import PreviewDownloadCV from './pages/client-site/candidate/profileCV/PreviewDownloadCV';
import MyJobsPage from './pages/client-site/candidate/my-job/MyJobs';
import ViewUserList from './pages/admin-site/ManageUser/ViewUserList';
import ViewPositionList from './pages/admin-site/ManagePosition/ViewPositionList';
import ViewTemplateCvList from './pages/admin-site/ManageTemplateCV/ViewTemplateCvList';
import ViewServicePlanList from './pages/admin-site/ManageServicePlan/ViewServicePlanList';
import ViewTaxonomyList from './pages/admin-site/ManageTaxonomy/ViewTaxonomyList';
import ResetPasswordPage from './pages/client-site/auth/ResetPasswordPage';
import CompaniesPage from './pages/client-site/guest/CompaniesPage';
import CompanyDetailPage from './pages/client-site/guest/CompanyDetailPage';
import JobDetailPage from './pages/client-site/guest/JobDetailPage';
import { ConfirmEmailPage } from './pages/client-site/auth/ConfirmEmailPage';
import ViewReportList from './pages/admin-site/ManageReport/ViewReportList';
import { StageBoardDemo } from './components/Stage/StageBoardDemo';
import InterviewSchedule from './pages/client-site/interview-schedule/interview-schedule';
import EvaluationHistory from './pages/client-site/evaluation-history/evaluation-history';
import PricingPage from './pages/client-site/pricing/pricing';
import OrderPage from './pages/client-site/order/order';
import InterviewConfirmPage from './pages/client-site/candidate/InterviewConfirmPage';

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Reset password route - Public */}
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Confirm email route - Public */}
      <Route path="/confirm-email" element={<ConfirmEmailPage />} />

      {/* Candidate interview confirm/reject - Public */}
      <Route path="/candidate/interview/confirm/:token" element={<InterviewConfirmPage />} />
      <Route path="/candidate/interview/reject/:token" element={<InterviewConfirmPage />} />

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
          <Route path="pricing" element={<PricingPage />} />
          <Route path="order/:id" element={<OrderPage />} />
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
        <Route path="manage-template-cv" element={<ViewTemplateCvList />} />
        <Route path="manage-service-plan" element={<ViewServicePlanList />} />
        <Route path="manage-position" element={<ViewPositionList />} />
        <Route path="manage-taxonomies" element={<ViewTaxonomyList />} />
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
        <Route path="service-packages" element={<ViewServicePackageList />} />
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

      <Route path="/hiringmanager" element={<ClientLayout />}>
        <Route path="interview-schedule" element={<InterviewSchedule />} />
        <Route path="evaluation-history" element={<EvaluationHistory />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes >
  );
};

export default AppRouter;
