import type { CVCertificate } from '@/models/cv-certificate';
import { BaseApiServices } from './base-api.service';
import type { BaseResponse, PaginationParamsInput } from '@/models/base';

export const CVCertificateServices = {
  getAll: (params?: Record<string, any>) => BaseApiServices.getAll<CVCertificate[]>('/CVCertificate', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<CVCertificate>('/CVCertificate', params),  
  getById: (id: string) => BaseApiServices.getById<CVCertificate>('/CVCertificate', id),
  create: (certificate: Omit<CVCertificate, 'id'>): Promise<BaseResponse<CVCertificate>> => BaseApiServices.create<CVCertificate>('/CVCertificate', certificate),
  update: (id: string, data: Partial<CVCertificate>) => BaseApiServices.update<CVCertificate>('/CVCertificate', id, data),
  delete: (id: string) => BaseApiServices.delete<CVCertificate>('/CVCertificate', id),
};
