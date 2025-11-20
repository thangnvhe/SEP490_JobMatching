import { BaseServices } from "./base.service";
import type { BaseResponse } from "@/models/base";

interface TaxonomyDto {
  id: number;
  name: string;
  candidateTaxonomies?: any[];
  jobTaxonomies?: any[];
}

export class TaxonomyService {
  private static API_URL = "/api/Taxonomy";

  static async getAllTaxonomies(): Promise<BaseResponse<TaxonomyDto[]>> {
    try {
      const response = await BaseServices.getAll<TaxonomyDto[]>({}, this.API_URL);
      return response;
    } catch (error) {
      console.error("Error fetching taxonomies:", error);
      throw error;
    }
  }

  static async getTaxonomyById(id: number): Promise<BaseResponse<TaxonomyDto>> {
    try {
      const response = await BaseServices.getById<TaxonomyDto>(id.toString(), this.API_URL);
      return response;
    } catch (error) {
      console.error("Error fetching taxonomy by id:", error);
      throw error;
    }
  }
}

export type { TaxonomyDto };