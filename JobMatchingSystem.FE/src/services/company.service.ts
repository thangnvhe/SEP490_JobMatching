import type { Company } from "@/models/company";
import { BaseServices } from "./base.service";
export const CompanyServices = {
  getAllCompanies: (params: any) =>
    BaseServices.getAll<Company[]>(params, "/company"),
  getCompanyById: (id: string) => BaseServices.getById<Company>(id, "/company"),
  createCompany: (companyFormData: FormData) =>
    BaseServices.create<string>(companyFormData, "/company"),
  updateCompany: (id: string, company: Company) =>
    BaseServices.update<Company>(id, company, "/company"),
  deleteCompany: (id: string) => BaseServices.delete(id, "/company"),
  // get all companies pending
  getAllPendingCompanies: (params: any) =>
    BaseServices.getAll<Company[]>(params, "/company/pending"),
  // accept a pending company
  // The API expects a POST to /api/company/accept with a body { CompanyId }
  acceptCompany: (id: string) =>
    // Ensure CompanyId is sent as a number to match backend DTO (int)
    BaseServices.create<string>({ CompanyId: Number(id) }, "/company/accept"),
  // reject a pending company
  // The API expects a POST to /api/company/reject with a body { CompanyId }
  rejectCompany: (id: string) =>
    BaseServices.create<string>({ CompanyId: Number(id) }, "/company/reject"),
};
    