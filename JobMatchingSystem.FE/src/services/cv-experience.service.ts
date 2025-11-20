import type { CVExperience } from '@/models/cv-experience';
import { BaseServices } from './base.service';
import axiosInstance from "@/interceptor/axiosInterceptor.old";
import type { BaseResponse, PaginationParamsInput } from "@/models/base";

export const CVExperienceServices = {
  // Lấy tất cả experiences
  getAll: (params?: any) => BaseServices.getAll<CVExperience[]>(params, '/CVExperience'),

  // Lấy experiences có phân trang
  getAllWithPagination: (params: PaginationParamsInput) => BaseServices.getAllWithPagination<CVExperience>(params, '/CVExperience'),

  // Lấy experience theo ID
  getById: (id: string) => BaseServices.getById<CVExperience>(id, '/CVExperience'),

  // Lấy experiences của user hiện tại
  getMyExperiences: async (): Promise<BaseResponse<CVExperience[]>> => {
    const response = await axiosInstance.get('/CVExperience/me');
    return response.data;
  },

  // Tạo mới experience
  create: (experience: Omit<CVExperience, 'id'>) => BaseServices.create<CVExperience>(experience, '/CVExperience'),

  // Cập nhật experience
  update: (id: string, data: Partial<CVExperience>) => BaseServices.update<CVExperience>(id, data, '/CVExperience'),

  // Xóa experience
  delete: (id: string) => BaseServices.delete(id, '/CVExperience'),
};
