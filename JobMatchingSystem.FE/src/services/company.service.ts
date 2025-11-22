import type { Company } from "@/models/company";
import type { BaseResponse, PaginationParamsInput } from "@/models/base";
import { BaseApiServices } from "./base-api.service";

export const CompanyServices = {
  getAllCompanies: (params: PaginationParamsInput) => 
    BaseApiServices.getAllWithPagination<Company>('/company', params),
  getCompanyById: (id: string) => BaseApiServices.getById<Company>('/company', id),
  createCompany: (companyData: Omit<Company, 'id'> | FormData): Promise<BaseResponse<Company>> =>
    BaseApiServices.create<Company>('/company', companyData),
  updateCompany: (id: string, companyData: Company | FormData): Promise<BaseResponse<Company>> =>
    BaseApiServices.update<Company>('/company', id, companyData),
  deleteCompany: (id: string) => BaseApiServices.delete<Company>('/company', id),
  // Accept company - POST /api/company/{id}/accept
  acceptCompany: (id: string) =>
    BaseApiServices.custom<Company>("post", `/company/${id}/accept`),
  // Reject company - POST /api/company/{id}/reject?rejectReason=reason
  rejectCompany: (id: string, rejectReason: string = "Không đạt yêu cầu") =>
    BaseApiServices.custom<Company>("post", `/company/${id}/reject`, undefined, { rejectReason }),
};