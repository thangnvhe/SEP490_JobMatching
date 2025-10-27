import type { Company } from "./company";

export interface Job {
    id: string;
    title: string;
    description: string;
    requirements: string;
    benefits: string;
    location: string;
    salary_min: number;
    salary_max: number;
    jobType: string;
    status: JobStatus;
    companyId: string;
    company: Company;
    createdAt: string;
    updatedAt: string;
}

export type JobStatus = {
    ACTIVE: 'active',
    INACTIVE: "inactive";
    CLOSED: "closed";
    DRAFT: "draft";
}

export interface JobTest {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logo?: string;
  };
  description: string;
  category: JobCategory;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  location: {
    city: string;
    country: string;
    isRemote?: boolean;
  };
  requirements: string[];
  benefits: string[];
  tags: string[];
  postedDate: string;
  expiryDate: string;
  isActive: boolean;
  isUrgent?: boolean;
  applicationCount?: number;
}

export interface JobCategory {
  id: string;
  name: string;
  count?: number;
}

export interface JobType {
  id: string;
  name: string;
  count?: number;
}

export interface ExperienceLevel {
  id: string;
  name: string;
  count?: number;
}

export interface DatePostedOption {
  id: string;
  name: string;
  value: string; // 'all', 'last-hour', 'last-24-hours', 'last-7-days', 'last-30-days'
  count?: number;
}

export interface SalaryRange {
  min: number;
  max: number;
}

export interface JobSearchFilters {
  keyword?: string;
  location?: string;
  categories?: string[];
  jobTypes?: string[];
  experienceLevels?: string[];
  datePosted?: string;
  salaryRange?: SalaryRange;
  tags?: string[];
}

export interface JobSearchParams extends JobSearchFilters {
  page: number;
  limit: number;
  sortBy: "latest" | "oldest" | "salary-high" | "salary-low" | "relevance";
}

export interface JobSearchResponse {
  jobs: JobTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  filters: {
    categories: JobCategory[];
    jobTypes: JobType[];
    experienceLevels: ExperienceLevel[];
    datePostedOptions: DatePostedOption[];
    popularTags: string[];
  };
}

export interface Location {
  id: string;
  name: string;
  country: string;
}

// Mock data constants
export const MOCK_CATEGORIES: JobCategory[] = [
  { id: "1", name: "Commerce", count: 10 },
  { id: "2", name: "Telecommunications", count: 10 },
  { id: "3", name: "Hotels & Tourism", count: 10 },
  { id: "4", name: "Education", count: 10 },
  { id: "5", name: "Financial Services", count: 10 },
  { id: "6", name: "Media", count: 8 },
  { id: "7", name: "Construction", count: 12 },
];

export const MOCK_JOB_TYPES: JobType[] = [
  { id: "1", name: "Full Time", count: 10 },
  { id: "2", name: "Part Time", count: 10 },
  { id: "3", name: "Freelance", count: 10 },
  { id: "4", name: "Seasonal", count: 10 },
  { id: "5", name: "Fixed-Price", count: 10 },
];

export const MOCK_EXPERIENCE_LEVELS: ExperienceLevel[] = [
  { id: "1", name: "No-experience", count: 10 },
  { id: "2", name: "Fresher", count: 10 },
  { id: "3", name: "Intermediate", count: 10 },
  { id: "4", name: "Expert", count: 10 },
];

export const MOCK_DATE_POSTED_OPTIONS: DatePostedOption[] = [
  { id: "1", name: "All", value: "all", count: 10 },
  { id: "2", name: "Last Hour", value: "last-hour", count: 10 },
  { id: "3", name: "Last 24 Hours", value: "last-24-hours", count: 10 },
  { id: "4", name: "Last 7 Days", value: "last-7-days", count: 10 },
  { id: "5", name: "Last 30 Days", value: "last-30-days", count: 10 },
];

export const MOCK_POPULAR_TAGS = [
  "engineering",
  "design",
  "ui/ux",
  "marketing",
  "management",
  "soft",
  "construction",
];

export const MOCK_LOCATIONS: Location[] = [
  { id: "1", name: "New York", country: "USA" },
  { id: "2", name: "Los Angeles", country: "USA" },
  { id: "3", name: "Texas", country: "USA" },
  { id: "4", name: "Florida", country: "USA" },
  { id: "5", name: "Boston", country: "USA" },
  { id: "6", name: "Ho Chi Minh City", country: "Vietnam" },
  { id: "7", name: "Hanoi", country: "Vietnam" },
];