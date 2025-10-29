export interface User {
    id: number;
    userName: string;
    email: string;
    fullName: string;
    avatarUrl: string | null;
    gender: string | null;
    birthday: string | null;
    score: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
    emailConfirmed: boolean;
    phoneNumber: string;
    role?: UserRole;
}

export interface UserLogin {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export type UserRole =
  | "admin"
  | "recruiter"
  | "candidate"
  | "staff"
  | "SuperRecruiter";
