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

export type ReportStatus = "Pending" | "Approved" | "Rejected";

export interface ReportItem {
  id: number;
  jobId: number;
  reporterId: number;
  verifiedById?: number | null;
  subject: string;
  reason: string;
  note?: string | null;
  status: ReportStatus;
  createdAt: string;
}

export interface GetReportPagedRequest {
  page?: number;
  size?: number;
  search?: string;
  sortBy?: string;
  isDescending?: boolean;
  jobId?: number;
  reporterId?: number;
  status?: ReportStatus;
  subject?: string;
  verifiedById?: number;
  createMin?: string;
  createMax?: string;
}