import type { TemplateCv } from "@/models/template-cv";
import { BaseServices } from "./base.service";
import { PaginationParamsInput } from "@/models/base";

export const TemplateCvServices = {
  getAll: (params?: any) => BaseServices.getAll<TemplateCv[]>(params, "/TemplateCv"),
  getAllWithPagination: (params: PaginationParamsInput) => BaseServices.getAllWithPagination<TemplateCv>(params, "/TemplateCv"),
  getById: (id: string) => BaseServices.getById<TemplateCv>(id, "/TemplateCv"),
  create: (formData: FormData) => BaseServices.create<TemplateCv>(formData, "/TemplateCv"),
  delete: (id: string) => BaseServices.delete(id, "/TemplateCv"),
};

