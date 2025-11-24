import { PaginationParamsInput } from "@/models/base";
import { BaseApiServices } from "./base-api.service";
import { CV, CVValidate } from "@/models/cv";

export const CVServices = {
  getAll: (params?: Record<string, any>) => BaseApiServices.getAll<CV[]>('/CV', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<CV>('/CV', params),
  getById: (id: string) => BaseApiServices.getById<CV>('/CV', id),
  create: (cv: Omit<CV, 'id'>) => BaseApiServices.create<CV>('/CV', cv),
  update: (id: string, cv: CV) => BaseApiServices.update<CV>('/CV', id, cv),
  delete: (id: string) => BaseApiServices.delete<CV>('/CV', id),
  setPrimary: (id: string) => BaseApiServices.custom<CV>('put', `/CV/${id}/set-primary`),
  getByUserId: (userId: string) => BaseApiServices.custom<CV[]>('get', `/CV/user/${userId}`),
  validate: (file: FormData) => BaseApiServices.custom<CVValidate>('post', `/CV/validate`, file),
};