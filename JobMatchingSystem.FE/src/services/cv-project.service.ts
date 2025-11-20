import type { CVProject } from '@/models/cv-project';
import { BaseServices } from './base.service';
import axiosInstance from "@/interceptor/axiosInterceptor.old";
import type { BaseResponse, PaginationParamsInput } from "@/models/base";

export const CVProjectServices = {
  // Lấy tất cả projects
  getAll: (params?: any) => BaseServices.getAll<CVProject[]>(params, '/CVProject'),

  // Lấy projects có phân trang
  getAllWithPagination: (params: PaginationParamsInput) => BaseServices.getAllWithPagination<CVProject>(params, '/CVProject'),

  // Lấy project theo ID
  getById: (id: string) => BaseServices.getById<CVProject>(id, '/CVProject'),

  // Lấy projects của user hiện tại
  getMyProjects: async (): Promise<BaseResponse<CVProject[]>> => {
    const response = await axiosInstance.get('/CVProject/me');
    return response.data;
  },

  // Tạo mới project
  create: (project: Omit<CVProject, 'id'>) => BaseServices.create<CVProject>(project, '/CVProject'),

  // Cập nhật project
  update: (id: string, data: Partial<CVProject>) => BaseServices.update<CVProject>(id, data, '/CVProject'),

  // Xóa project
  delete: (id: string) => BaseServices.delete(id, '/CVProject'),
};
