import { BaseServices } from "./base.service";
import type { PaginatedResponse } from "@/models/base";
import type { ReportItem, GetReportPagedRequest } from "@/models/report";

export class ReportAdminService {
  private static API_URL = "/api/Report";

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