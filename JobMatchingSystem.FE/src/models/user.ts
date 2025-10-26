export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
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
