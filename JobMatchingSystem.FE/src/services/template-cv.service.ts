import type { TemplateCv } from "@/models/template-cv";
import { BaseApiServices } from "./base-api.service";
import { PaginationParamsInput } from "@/models/base";

export const TemplateCvServices = {
  getAll: (params?: Record<string, any>) => BaseApiServices.getAll<TemplateCv[]>('/TemplateCv', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<TemplateCv>('/TemplateCv', params),
  getById: (id: string) => BaseApiServices.getById<TemplateCv>('/TemplateCv', id),
  create: (formData: FormData) => BaseApiServices.create<TemplateCv>('/TemplateCv', formData),
  delete: (id: string) => BaseApiServices.delete<TemplateCv>('/TemplateCv', id),
};

