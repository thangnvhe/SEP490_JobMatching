import { CandidateStatsCards } from "@/components/ui/candidate/CandidateStatsCards";
import { JobRecommendations } from "@/components/ui/candidate/JobRecommendations";
import { ApplicationStatus } from "@/components/ui/candidate/ApplicationStatus";
import { InterviewSchedule } from "@/components/ui/candidate/InterviewSchedule";
import { ProfileCompleteness } from "@/components/ui/candidate/ProfileCompleteness";
import { RecentActivity } from "@/components/ui/candidate/RecentActivity";

export default function CandidateDashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, John!
            </h1>
            <p className="text-muted-foreground">
              Here's an overview of your job search progress and opportunities.
            </p>
          </div>

          {/* Stats Cards */}
          <CandidateStatsCards />

          {/* Profile completeness and quick actions */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-3 lg:px-6">
            <div className="lg:col-span-2">
              <JobRecommendations />
            </div>
            <div>
              <ProfileCompleteness />
            </div>
          </div>

          {/* Application status and interviews */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
            <ApplicationStatus />
            <InterviewSchedule />
          </div>

          {/* Recent activity */}
          <div className="px-4 lg:px-6">
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
