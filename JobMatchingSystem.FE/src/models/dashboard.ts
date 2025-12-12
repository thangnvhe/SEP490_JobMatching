// Recruiter Dashboard
export interface RecruiterDashboard {
  jobsCreated: number;
  recentCreatedJobs: JobShortInfo[];
  jobsApproved: number;
  recentApprovedJobs: JobShortInfo[];
  totalSpent: number;
  purchasedPlans: RecruiterOrderInfo[];
  candidatesApplied: number;
  recentCandidates: CandidateAppliedInfo[];
}

export interface JobShortInfo {
  jobId: number;
  title: string;
  createdAt: string;
  status: number;
}

export interface RecruiterOrderInfo {
  orderId: number;
  planName: string;
  amount: number;
  purchasedAt: string;
}

export interface CandidateAppliedInfo {
  candidateJobId: number;
  jobId: number;
  jobTitle: string;
  candidateName: string;
  cvId?: number;
  appliedAt: string;
}

// Hiring Manager Dashboard
export interface HiringManagerDashboard {
  totalReviewedCandidates: number;
  pendingReviewCount: number;
  pendingReviews: PendingReviewDto[];
  upcomingInterviewCount: number;
  upcomingInterviews: UpcomingInterviewDto[];
  approvedThisMonth: number;
  rejectedThisMonth: number;
}

export interface PendingReviewDto {
  candidateStageId: number;
  candidateJobId: number;
  candidateName: string;
  jobTitle: string;
  stageName: string;
  submittedAt?: string;
  interviewLocation?: string;
  googleMeetLink?: string;
}

export interface UpcomingInterviewDto {
  candidateStageId: number;
  candidateJobId: number;
  candidateName: string;
  jobTitle: string;
  stageName: string;
  interviewDateTime?: string;
  interviewLocation?: string;
  googleMeetLink?: string;
}

// Candidate Dashboard
export interface CandidateDashboard {
  totalAppliedJobs: number;
  recentAppliedJobs: AppliedJobDto[];
  upcomingInterviewCount: number;
  upcomingStages: UpcomingStageDto[];
  totalSavedJobs: number;
  recentSavedJobs: SavedJobDto[];
  totalReports: number;
}

export interface AppliedJobDto {
  jobId: number;
  jobTitle: string;
  appliedAt: string;
}

export interface UpcomingStageDto {
  jobTitle: string;
  stageName: string;
  scheduleTime?: string;
}

export interface SavedJobDto {
  jobId: number;
  jobTitle: string;
  savedAt: string;
}

// Admin Dashboard
export interface AdminDashboard {
  newCompanies: number;
  approvedCompanies: number;
  newJobs: number;
  openedJobs: number;
  newReports: number;
  monthlyRevenue: number;
  successfulOrders: number;
  topServicePlans: TopServicePlanDto[];
  recentCompanies: RecentCompanyDto[];
  recentApprovedCompanies: RecentCompanyDto[];
  recentOrders: RecentOrderDto[];
  recentJobs: RecentJobDto[];
}

export interface TopServicePlanDto {
  serviceId: number;
  name: string;
  purchaseCount: number;
}

export interface RecentCompanyDto {
  companyId: number;
  name: string;
  createdAt: string;
  status: number;
}

export interface RecentOrderDto {
  id: number;
  amount: number;
  createdAt: string;
}

export interface RecentJobDto {
  jobId: number;
  title: string;
  createdAt: string;
}
