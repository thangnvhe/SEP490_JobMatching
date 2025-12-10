import { BaseResponse } from "@/models/base";
import { BaseApiServices } from "./base-api.service";
import { CandidateTaxonomy } from "@/models/candidate-taxonomy";

export const CandidateTaxonomyService = {
    getAll: () => BaseApiServices.getAll<CandidateTaxonomy[]>("/CandidateTaxonomy"),
    getById: (id: number) => BaseApiServices.getById<CandidateTaxonomy>("/CandidateTaxonomy", id),
    create: (taxonomy: Partial<CandidateTaxonomy>) => BaseApiServices.create<CandidateTaxonomy>("/CandidateTaxonomy", taxonomy),
    update: (id: number, taxonomy: Partial<CandidateTaxonomy>) => BaseApiServices.update<CandidateTaxonomy>("/CandidateTaxonomy", id, taxonomy),
    delete: (id: number) => BaseApiServices.delete<CandidateTaxonomy>("/CandidateTaxonomy", id),

    getMyTaxonomies: () => BaseApiServices.custom<BaseResponse<CandidateTaxonomy[]>>("get", "/CandidateTaxonomy/me"),

}