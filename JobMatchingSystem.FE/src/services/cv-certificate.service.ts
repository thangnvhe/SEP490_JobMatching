import type { CVCertificate } from '@/models/cv-certificate';
import { BaseServices } from './base.service';
import axiosInstance from "@/interceptor/axiosInterceptor.old";
import type { BaseResponse, PaginationParamsInput } from "@/models/base";

export const CVCertificateServices = {
  // Lấy tất cả certificates
  getAll: (params?: any) => BaseServices.getAll<CVCertificate[]>(params, '/CVCertificate'),

  // Lấy certificates có phân trang
  getAllWithPagination: (params: PaginationParamsInput) => BaseServices.getAllWithPagination<CVCertificate>(params, '/CVCertificate'),

  // Lấy certificate theo ID
  getById: (id: string) => BaseServices.getById<CVCertificate>(id, '/CVCertificate'),

  // Lấy certificates của user hiện tại
  getMyCertificates: async (): Promise<BaseResponse<CVCertificate[]>> => {
    const response = await axiosInstance.get('/CVCertificate/me');
    return response.data;
  },

  // Tạo mới certificate
  create: (certificate: Omit<CVCertificate, 'id'>) => BaseServices.create<CVCertificate>(certificate, '/CVCertificate'),

  // Cập nhật certificate
  update: (id: string, data: Partial<CVCertificate>) => BaseServices.update<CVCertificate>(id, data, '/CVCertificate'),

  // Xóa certificate
  delete: (id: string) => BaseServices.delete(id, '/CVCertificate'),
};
