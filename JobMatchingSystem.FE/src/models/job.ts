import { Taxonomy } from './taxonomy';

// Định nghĩa các loại công việc
export type JobType = 'FullTime' | 'PartTime' | 'Remote' | 'Other';
export type JobStatus = 'Draft' | 'Rejected' | 'Moderated' | 'Opened' | 'Closed';


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
}



