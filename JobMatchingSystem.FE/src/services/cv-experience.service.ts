import type { CVExperience } from '@/models/cv-experience';
import { BaseApiServices } from './base-api.service';
import type { BaseResponse, PaginationParamsInput } from "@/models/base";

export const CVExperienceServices = {
  getAll: (params?: Record<string, any>) => BaseApiServices.getAll<CVExperience[]>('/CVExperience', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<CVExperience>('/CVExperience', params),
  getById: (id: string) => BaseApiServices.getById<CVExperience>('/CVExperience', id),
  getMyExperiences: () => BaseApiServices.custom("get", "/CVExperience/me"),
  create: (experience: Omit<CVExperience, 'id'>): Promise<BaseResponse<CVExperience>> => BaseApiServices.create<CVExperience>('/CVExperience', experience),
  update: (id: string, data: Partial<CVExperience>) => BaseApiServices.update<CVExperience>('/CVExperience', id, data),
  delete: (id: string) => BaseApiServices.delete<CVExperience>('/CVExperience', id),
};
