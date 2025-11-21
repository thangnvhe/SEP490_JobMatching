import { BaseServices } from "./base.service";
import type { BaseResponse } from "@/models/base";
import type { CreateReportRequest, ReportItem, GetReportPagedRequest, CensorReportRequest } from "@/models/report";
import { getReportStatusEnum } from "@/models/report";

export class ReportService {
  private static API_URL = "/Report";

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
  ): Promise<BaseResponse<any>> { // Changed return type to match API response structure
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
  ): Promise<BaseResponse<any>> {
    try {
      const requestData: CensorReportRequest = {
        status: getReportStatusEnum(status),
        note: note || "",
      };
      
      console.log("Sending censor request:", { reportId, requestData });
      
      const response = await BaseServices.update<any>(
        reportId.toString(),
        requestData,
        `${this.API_URL}/censor`
      );
      return response;
    } catch (error) {
      console.error("Error updating report status:", error);
      throw error;
    }
  }
}

export type { CreateReportRequest, ReportItem, GetReportPagedRequest, CensorReportRequest };