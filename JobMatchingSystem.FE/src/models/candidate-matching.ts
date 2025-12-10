export interface CandidateMatchingResult {
  candidateId: string;
  candidateName: string;
  birthday: string;
  gender: boolean;
  email: string;
  phoneNumber: string;
  address: string;
  position: string;
  totalScore: number;
  matchedAt: string;
  primaryCV: PrimaryCV;
  skills: CandidateSkill[];
  workExperiences: WorkExperience[];
  educations: Education[];
}

export interface PrimaryCV {
  cvId: number;
  fileName: string;
  fileUrl: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface CandidateSkill {
  taxonomyId: number;
  skillName: string;
  experienceYear: number;
}

export interface WorkExperience {
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  schoolName: string;
  educationLevelName: string;
  rankScore: number;
  major: string;
  startDate: string;
  endDate: string;
}

export interface CandidateSearchFilters {
  jobId: string;
  page?: number;
  size?: number;
  minExperience?: number;
  maxExperience?: number;
  requiredSkills?: number[];
  educationLevelId?: number;
}

export interface CandidateSearchResponse {
  items: CandidateMatchingResult[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}