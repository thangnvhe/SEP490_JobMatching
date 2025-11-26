import type { Company } from "@/models/company";
import type { BaseResponse, PaginationParamsInput } from "@/models/base";
import { BaseApiServices } from "./base-api.service";

export const CompanyServices = {
  getAllCompanies: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<Company>('/Company', params),
  getCompanyById: (id: string) => BaseApiServices.getById<Company>('/Company', id),
  createCompany: (companyData: Omit<Company, 'id'> | FormData): Promise<BaseResponse<Company>> =>
    BaseApiServices.create<Company>('/Company', companyData),
  updateCompany: (id: string, companyData: Company | FormData): Promise<BaseResponse<Company>> =>
    BaseApiServices.update<Company>('/Company', id, companyData),
  deleteCompany: (id: string) => BaseApiServices.delete<Company>('/Company', id),
  // Accept company - POST /api/company/{id}/accept
  acceptCompany: (id: string) => BaseApiServices.custom<Company>("post", `/Company/${id}/accept`),
  // Reject company - POST /api/company/{id}/reject?rejectReason=reason
  rejectCompany: (id: string, rejectReason: string = "Không đạt yêu cầu") => 
    BaseApiServices.custom<BaseResponse<Company>>("post", `/Company/${id}/reject`, undefined, { rejectReason }),
  // Change status (soft delete) - PUT /api/company/{id}/change-status
  changeStatus: (id: string) => BaseApiServices.custom<Company>("put", `/Company/${id}/change-status`),
};