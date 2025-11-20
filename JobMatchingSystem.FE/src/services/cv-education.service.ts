import type { CVEducation } from '@/models/cv-education';
import { BaseServices } from './base.service';
import axiosInstance from "@/interceptor/axiosInterceptor.old";
import type { BaseResponse, PaginationParamsInput } from "@/models/base";

export const CVEducationServices = {
  // Lấy tất cả educations
  getAll: (params?: any) => BaseServices.getAll<CVEducation[]>(params, '/CVEducation'),

  // Lấy educations có phân trang
  getAllWithPagination: (params: PaginationParamsInput) => BaseServices.getAllWithPagination<CVEducation>(params, '/CVEducation'),

  // Lấy education theo ID
  getById: (id: string) => BaseServices.getById<CVEducation>(id, '/CVEducation'),

  // Lấy educations của user hiện tại
  getMyEducations: async (): Promise<BaseResponse<CVEducation[]>> => {
    const response = await axiosInstance.get('/CVEducation/me');
    return response.data;
  },

  // Tạo mới education
  create: (education: Omit<CVEducation, 'id'>) => BaseServices.create<CVEducation>(education, '/CVEducation'),

  // Cập nhật education
  update: (id: string, data: Partial<CVEducation>) => BaseServices.update<CVEducation>(id, data, '/CVEducation'),

  // Xóa education
  delete: (id: string) => BaseServices.delete(id, '/CVEducation'),
};
