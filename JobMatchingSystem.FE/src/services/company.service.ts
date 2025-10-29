import type { Company } from "@/models/company";
import { BaseServices } from "./base.service";
export const CompanyServices = {
  getAllCompanies: (params: any) =>
    BaseServices.getAll<Company[]>("/companies", params),
  getCompanyById: (id: string) =>
    BaseServices.getById<Company>(id, "/companies"),
  createCompany: (companyFormData: FormData) =>
    BaseServices.create<string>(companyFormData, "/company"),
  updateCompany: (id: string, company: Company) =>
    BaseServices.update<Company>(id, company, "/companies"),
  deleteCompany: (id: string) => BaseServices.delete(id, "/companies"),
};
    