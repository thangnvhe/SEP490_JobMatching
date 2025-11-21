export type ReportType =
  | "Spam"
  | "InappropriateContent"
  | "FraudulentJobPosting"
  | "Other";

export interface CreateReportRequest {
  jobId: number;
  subject: ReportType;
  reason: string;
}

export interface CensorReportRequest {
  status: number; // enum value: 0=Pending, 1=Approved, 2=Rejected
  note?: string;
}

export type ReportStatus = "Pending" | "Approved" | "Rejected";

// Helper to convert status string to enum number
export const getReportStatusEnum = (status: string): number => {
  switch (status) {
    case "Pending": return 0;
    case "Approved": return 1;
    case "Rejected": return 2;
    default: return 0;
  }
};

export interface ReportItem {
  id: number;
  jobId: number;
  reporterId: number;
  verifiedById?: number | null;
  subject: string;
  reason: string;
  note?: string | null;
  status: string; // Changed from ReportStatus to string to match backend
  createdAt: string;
  // Additional fields for display
  jobTitle?: string;
  reporterName?: string;
}

export interface GetReportPagedRequest {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  isDescending?: boolean; // Fixed spelling
  jobId?: number;
  reporterId?: number;
  status?: string; // Changed from ReportStatus to string
  subject?: string;
  verifiedById?: number;
  createMin?: string;
  createMax?: string;
}