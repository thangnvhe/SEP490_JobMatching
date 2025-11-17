// Taxonomy interface for jobs
export interface JobTaxonomy {
  id: number;
  name: string;
}

// Interfaces cho API request/response theo backend
export interface JobSearchParams {
  Search?: string;   // Added Search parameter
  Title?: string;
  Description?: string;
  Requirements?: string;
  Benefits?: string;
  Location?: string;
  SalaryMin?: number;
  SalaryMax?: number;
  JobType?: string; // Changed from number to string
  Status?: number;
  CompanyId?: number;
  RecuiterId?: number;
  TaxonomyIds?: number[];
  ExperienceYearMin?: number; // Changed to Min/Max range
  ExperienceYearMax?: number; // Added Max range
  Page?: number;   // Changed from page to Page
  Size?: number;   // Changed from size to Size
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
  experienceYear?: number;  // Added experience field
  jobType: string;
  status: string;
  viewsCount: number;
  companyId: number;
  recuiterId: number;
  verifiedBy?: number;
  createdAt: string;
  openedAt?: string;
  expiredAt?: string;
  taxonomies: JobTaxonomy[];  // Updated to use object array
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