import { ReportItem } from "@/models/report";
import { BaseApiServices } from "./base-api.service";
import { PaginationParamsInput } from "@/models/base";

export const ReportService = {
  getAll: (params: Record<string, any>) => BaseApiServices.getAll<ReportItem[]>('/Report', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<ReportItem>('/Report/paged', params),
  getById: (reportId: number) => BaseApiServices.getById<ReportItem>('/Report', reportId),
  create: (reportData: Pick<ReportItem, 'jobId' | 'subject' | 'reason'>) =>
    BaseApiServices.create<ReportItem>('/Report', reportData),
  update: (reportId: number, reportData: Pick<ReportItem, 'subject' | 'reason'>) =>
    BaseApiServices.update<ReportItem>('/Report', reportId, reportData),
  delete: (reportId: number) => BaseApiServices.delete<ReportItem>('/Report', reportId),

  updateReportCensor: (reportId: number, reportData: Pick<ReportItem, 'status' | 'note'>) =>
    BaseApiServices.update<ReportItem>('/Report/censor', reportId, reportData),
}   