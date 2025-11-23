import { Taxonomy } from "@/models/taxonomy";
import { BaseApiServices } from "./base-api.service";

export const TaxonomyService = {
  getAllTaxonomies: () => BaseApiServices.getAll<Taxonomy[]>('/Taxonomy'),
  getTaxonomyById: (id: string) => BaseApiServices.getById<Taxonomy>('/Taxonomy', id),
};