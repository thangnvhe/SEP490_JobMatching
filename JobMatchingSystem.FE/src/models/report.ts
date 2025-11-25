export type ReportType =
  | "Spam"
  | "InappropriateContent"
  | "FraudulentJobPosting"
  | "Other";
  
export const ReportStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const

export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

export interface ReportItem {
  id: number;
  jobId: number;
  reporterId: number;
  verifiedById: number | null;
  subject: string;
  reason: string;
  note: string | null;
  status: ReportStatus;
  createdAt: string;
  verifiedAt: string | null;

  // Optional UI fields
  jobTitle?: string;
  reporterName?: string;
}
