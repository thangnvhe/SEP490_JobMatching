import { RecruiterStatsCards } from "@/components/ui/recruiter/RecruiterStatsCards";
import { JobPostingsChart } from "@/components/ui/recruiter/JobPostingsChart";
import { RecentApplications } from "@/components/ui/recruiter/RecentApplications";
import { TopPerformingJobs } from "@/components/ui/recruiter/TopPerformingJobs";
import { CandidatePipeline } from "@/components/ui/recruiter/CandidatePipeline";

export default function RecruiterDashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your recruitment
              activities.
            </p>
          </div>

          {/* Stats Cards */}
          <RecruiterStatsCards />

          {/* Charts and Analytics */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
            <JobPostingsChart />
            <CandidatePipeline />
          </div>

          {/* Recent Activity and Top Jobs */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
            <RecentApplications />
            <TopPerformingJobs />
          </div>
        </div>
      </div>
    </div>
  );
}
