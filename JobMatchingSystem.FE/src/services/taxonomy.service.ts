import { Taxonomy } from "@/models/taxonomy";
import { BaseApiServices } from "./base-api.service";
import { PaginationParamsInput } from "@/models/base";

export const TaxonomyService = {
  getAllTaxonomies: () => BaseApiServices.getAll<Taxonomy[]>('/Taxonomy'),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<Taxonomy>('/Taxonomy/paged', params),
  update: (id: string, data: Partial<Taxonomy>) => BaseApiServices.update<Taxonomy>('/Taxonomy', id, data),
  delete: (id: string) => BaseApiServices.delete<Taxonomy>('/Taxonomy', id),
  create: (data: Partial<Taxonomy>) => BaseApiServices.create<Taxonomy>('/Taxonomy', data),
  getTaxonomyById: (id: string) => BaseApiServices.getById<Taxonomy>('/Taxonomy', id),
  getTaxonomyByParentId: (parentId: string) => BaseApiServices.getAll<Taxonomy[]>(`/Taxonomy/parent/${parentId}/children`),
};