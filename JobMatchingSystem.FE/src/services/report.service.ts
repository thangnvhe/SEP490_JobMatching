import { BaseServices } from "./base.service";
import type { BaseResponse, PaginatedResponse } from "@/models/base";
import type { CreateReportRequest, ReportItem, GetReportPagedRequest } from "@/models/report";

export class ReportService {
  private static API_URL = "/api/Report";

  // User report creation (for guest users reporting jobs)
  static async createReport(reportData: CreateReportRequest): Promise<BaseResponse<any>> {
    try {
      const response = await BaseServices.create<any>(reportData, this.API_URL);
      return response;
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  }

  // Admin report management (for admin users managing reports)
  static async getReportsWithPagination(
    params: GetReportPagedRequest
  ): Promise<PaginatedResponse<ReportItem>> {
    try {
      const response = await BaseServices.getAllWithPagination<ReportItem>(
        {
          page: params.page || 1,
          size: params.size || 10,
          search: params.search || "",
          sortBy: params.sortBy || "",
          isDescending: params.isDescending || false,
          jobId: params.jobId,
          reporterId: params.reporterId,
          status: params.status,
          subject: params.subject,
          verifiedById: params.verifiedById,
          createMin: params.createMin,
          createMax: params.createMax,
        },
        `${this.API_URL}/paged`
      );
      return response;
    } catch (error) {
      console.error("Error fetching reports:", error);
      throw error;
    }
  }

  static async updateReportStatus(
    reportId: number,
    status: string,
    note?: string
  ): Promise<any> {
    try {
      const response = await BaseServices.create<any>(
        {
          status,
          note: note || "",
        },
        `${this.API_URL}/${reportId}/status`
      );
      return response;
    } catch (error) {
      console.error("Error updating report status:", error);
      throw error;
    }
  }
}

export type { CreateReportRequest, ReportItem, GetReportPagedRequest };