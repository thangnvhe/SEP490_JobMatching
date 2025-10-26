export interface User {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export type UserRole = {
    ADMIN: "admin";
    RECRUITER: "recruiter";
    CANDIDATE: "candidate";
}   