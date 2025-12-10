import { Taxonomy } from './taxonomy';

// Định nghĩa các loại công việc
export type JobType = 'FullTime' | 'PartTime' | 'Remote' | 'Other';
export type JobStatus = 'Draft' | 'Rejected' | 'Moderated' | 'Opened' | 'Closed';
export const CandidateJobStatus = { Pending: 0, RejectCv: 1, Processing: 2, Fail: 3, Pass: 4, } as const;
export type CandidateJobStatus = typeof CandidateJobStatus[keyof typeof CandidateJobStatus];

export interface Job {
  jobId: number;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin?: number;
  salaryMax?: number;
  location: string;
  experienceYear?: number;
  jobType: JobType;
  status: JobStatus;
  viewsCount: number;
  companyId: number;
  recuiterId: number;
  verifiedBy?: number;
  createdAt: string;
  openedAt?: string;
  expiredAt?: string;
  isDeleted: boolean;
  taxonomies: Taxonomy[];
  isReport?: boolean;
  isApply?: boolean;
  isSave?: boolean;
  applyCount?: number;
  isHighlight: boolean;
  positionId?: number;
}

export interface CandidateJob {
  id: number;
  jobId: number;
  cvId?: number;
  status: CandidateJobStatus;
  appliedAt: string;
  updatedAt: string;
}

export interface SavedJob {
  id: number;
  jobId: number;
}