// Base API Response từ backend - phải match với C# APIResponse
export interface APIResponse<T = any> {
  result: T;
  statusCode: number;
  isSuccess: boolean; // Backend uses IsSuccess, not success
  errorMessages?: string[]; // Backend uses ErrorMessages, not errors
}

// Auth models
export interface LoginRequest {
  username: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Job models
export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary: number;
  jobType: string;
  status: string;
  companyId: string;
  company: Company;
  createdAt: string;
  updatedAt: string;
}

// Company models
export interface Company {
  id: string;
  name: string;
  description: string;
  website: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Constants
export const UserRole = {
  ADMIN: 'admin',
  RECRUITER: 'recruiter',
  CANDIDATE: 'candidate'
} as const;

export const JobStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  CLOSED: 'closed',
  DRAFT: 'draft'
} as const;

export const CompanyStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];
export type JobStatusType = typeof JobStatus[keyof typeof JobStatus];
export type CompanyStatusType = typeof CompanyStatus[keyof typeof CompanyStatus];