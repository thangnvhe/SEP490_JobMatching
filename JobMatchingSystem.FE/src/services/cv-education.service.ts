import type { CVEducation } from '@/models/cv-education';
import { BaseApiServices } from './base-api.service';
import type { BaseResponse, PaginationParamsInput } from "@/models/base";

export const CVEducationServices = {
  getAll: (params?: Record<string, any>) => BaseApiServices.getAll<CVEducation[]>('/CVEducation', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<CVEducation>('/CVEducation', params),
  getById: (id: string) => BaseApiServices.getById<CVEducation>('/CVEducation', id),
  create: (education: Omit<CVEducation, 'id'>): Promise<BaseResponse<CVEducation>> => BaseApiServices.create<CVEducation>('/CVEducation', education),
  update: (id: string, data: Partial<CVEducation>) => BaseApiServices.update<CVEducation>('/CVEducation', id, data),
  delete: (id: string) => BaseApiServices.delete<CVEducation>('/CVEducation', id),
  getMyEducations: () => BaseApiServices.custom<BaseResponse<CVEducation[]>>("get", "/CVEducation/me"),
};
