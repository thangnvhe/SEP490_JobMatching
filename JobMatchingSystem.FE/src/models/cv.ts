import { User } from "./user";

export interface CV {
    id: number;
    userId: number;
    name: string;
    isPrimary: boolean;
    fileName: string;
    fileUrl: string;
    savedCVs: any[];
    candidateJobs: any[];
    user: User;
}

// Interface cho response từ /api/CV/all
export interface CVDetail {
    id: number;
    name: string;
    isPrimary: boolean;
    fileName: string;
    fileUrl: string;
    user: {
        id: number;
        fullName: string;
        email: string;
        phoneNumber: string;
    };
}

export interface CVValidate {
    is_cv: boolean,
    confidence: number,
    reason: string,
    file_info: {
        filename: string,
        file_size_mb: number,
        num_pages: number,
        text_length: number,
        error: string
    }
}