export const ReportTypes = {
  Spam: 0,
  InappropriateContent: 1,
  FraudulentJobPosting: 2,
  Other: 3,
} as const

export const ReportStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const

export type ReportTypes = typeof ReportTypes[keyof typeof ReportTypes];
export type ReportStatus = typeof ReportStatus[keyof typeof ReportStatus];

export interface ReportItem {
  id: number;
  jobId: number;
  reporterId: number;
  verifiedById: number | null;
  subject: number;
  reason: string;
  note: string | null;
  status: ReportStatus;
  createdAt: string;
  verifiedAt: string | null;

  // Optional UI fields
  jobTitle?: string;
  reporterName?: string;
}

export interface ReportCreateInput {
  jobId: number;
  subject: number;
  reason: string;
}
