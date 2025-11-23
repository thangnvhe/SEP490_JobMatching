import type { CVProject } from '@/models/cv-project';
import { BaseApiServices } from './base-api.service';
import type { BaseResponse, PaginationParamsInput } from "@/models/base";

export const CVProjectServices = {
  getAll: (params?: Record<string, any>) => BaseApiServices.getAll<CVProject[]>('/CVProject', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<CVProject>('/CVProject', params),
  getById: (id: string) => BaseApiServices.getById<CVProject>('/CVProject', id),
  create: (project: Omit<CVProject, 'id'>): Promise<BaseResponse<CVProject>> => BaseApiServices.create<CVProject>('/CVProject', project),
  update: (id: string, data: Partial<CVProject>) => BaseApiServices.update<CVProject>('/CVProject', id, data),
  delete: (id: string) => BaseApiServices.delete<CVProject>('/CVProject', id),
  getMyProjects: () => BaseApiServices.custom<CVProject[]>("get", "/CVProject/me"),
};
