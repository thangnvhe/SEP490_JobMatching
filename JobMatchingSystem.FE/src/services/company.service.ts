import type { Company } from "@/models/company";
import { BaseServices } from "./base.service";
export const CompanyServices = {
  getAllCompanies: (params: any) =>
    BaseServices.getAll<any>(params, "/company"),
  getCompanyById: (id: string) => BaseServices.getById<Company>(id, "/company"),
  createCompany: (companyFormData: FormData) =>
    BaseServices.create<string>(companyFormData, "/company"),
  updateCompany: (id: string, company: Company) =>
    BaseServices.update<Company>(id, company, "/company"),
  deleteCompany: (id: string) => BaseServices.delete(id, "/company"),
  // Accept company - POST /api/company/{id}/accept
  acceptCompany: (id: string) =>
    BaseServices.create<string>({}, `/company/${id}/accept`),
  // Reject company - POST /api/company/{id}/reject?rejectReason=reason
  rejectCompany: (id: string, rejectReason: string = "Không đạt yêu cầu") =>
    BaseServices.create<string>({}, `/company/${id}/reject?rejectReason=${encodeURIComponent(rejectReason)}`),
};
    