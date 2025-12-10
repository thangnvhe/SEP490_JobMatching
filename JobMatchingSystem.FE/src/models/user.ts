export interface User {
    id: number;
    userName: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    gender: boolean | null;
    birthday: string | null;
    score: number;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string | null;
    emailConfirmed?: boolean;
    phoneNumber: string;
    address: string;
    companyId: number | null;
    role?: UserRole;
}

export type UserRole =
  | "Admin"
  | "Recruiter"
  | "Candidate"
  | "Hiringmanager";

export interface CreateHiringManagerRequest {
  fullName: string;
  email: string;
  phone: string;
  companyId: number;
}
