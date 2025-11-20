import type { CVAchievement } from '@/models/cv-achievement';
import { BaseServices } from './base.service';
import axiosInstance from "@/interceptor/axiosInterceptor.old";
import type { BaseResponse, PaginationParamsInput } from "@/models/base";

export const CVAchievementServices = {
  // Lấy tất cả achievements
  getAll: (params?: any) => BaseServices.getAll<CVAchievement[]>(params, '/CVAchievement'),

  // Lấy achievements có phân trang
  getAllWithPagination: (params: PaginationParamsInput) => BaseServices.getAllWithPagination<CVAchievement>(params, '/CVAchievement'),

  // Lấy achievement theo ID
  getById: (id: string) => BaseServices.getById<CVAchievement>(id, '/CVAchievement'),

  // Lấy achievements của user hiện tại
  getMyAchievements: async (): Promise<BaseResponse<CVAchievement[]>> => {
    const response = await axiosInstance.get('/CVAchievement/me');
    return response.data;
  },

  // Tạo mới achievement
  create: (achievement: Omit<CVAchievement, 'id'>) => BaseServices.create<CVAchievement>(achievement, '/CVAchievement'),

  // Cập nhật achievement
  update: (id: string, data: Partial<CVAchievement>) => BaseServices.update<CVAchievement>(id, data, '/CVAchievement'),

  // Xóa achievement
  delete: (id: string) => BaseServices.delete(id, '/CVAchievement'),
};
