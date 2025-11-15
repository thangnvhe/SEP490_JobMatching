// Interfaces cho API request/response theo backend
export interface JobSearchParams {
  Title?: string;
  Description?: string;
  Requirements?: string;
  Benefits?: string;
  Location?: string;
  SalaryMin?: number;
  SalaryMax?: number;
  JobType?: number;
  Status?: number;
  CompanyId?: number;
  RecuiterId?: number;
  TaxonomyIds?: number[];
  page?: number;
  size?: number;
  sortBy?: string;
}

export interface JobDetailResponse {
  jobId: number;
  title: string;
  description: string;
  requirements: string;
  benefits: string;
  salaryMin?: number;
  salaryMax?: number;
  location: string;
  jobType: string;
  status: string;
  viewsCount: number;
  companyId: number;
  recuiterId: number;
  verifiedBy?: number;
  createdAt: string;
  openedAt?: string;
  expiredAt?: string;
  taxonomies: string[];
}

export interface JobSearchFilters {
  jobType?: string;
  experienceLevel?: string;
  salaryRange?: string;
}

export interface SearchState {
  keyword: string;
  location: string;
  filters: JobSearchFilters;
  pagination: {
    page: number;
    size: number;
    sortBy: string;
  };
}