import type { CVAchievement } from '@/models/cv-achievement';
import type { BaseResponse, PaginationParamsInput } from '@/models/base';
import { BaseApiServices } from './base-api.service';

export const CVAchievementServices = {
  getAll: (params?: Record<string, any>) => BaseApiServices.getAll<CVAchievement[]>('/CVAchievement', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<CVAchievement>('/CVAchievement', params),
  getById: (id: string) => BaseApiServices.getById<CVAchievement>('/CVAchievement', id),
  create: (achievement: Omit<CVAchievement, 'id'>): Promise<BaseResponse<CVAchievement>> => BaseApiServices.create<CVAchievement>('/CVAchievement', achievement),
  update: (id: string, data: Partial<CVAchievement>) => BaseApiServices.update<CVAchievement>('/CVAchievement', id, data),
  delete: (id: string) => BaseApiServices.delete<CVAchievement>('/CVAchievement', id),
  getMyAchievements: () => BaseApiServices.custom<BaseResponse<CVAchievement[]>>("get", "/CVAchievement/me"),
};
