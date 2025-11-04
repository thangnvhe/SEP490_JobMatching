import type { User } from '@/models/user';
import { BaseServices } from './base.service';
import axiosInstance from "@/interceptor/axiosInterceptor.old";
import type { BaseResponse } from "@/models/base";
import type { PaginationParamsInput } from "@/models/base";

export const UserServices = {
  getAll: (params?: any) => BaseServices.getAll<User[]>('/User', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseServices.getAllWithPagination<User>(params, '/User'),
  getById: (id: string) => BaseServices.getById<User>(id, '/User'),
  create: (user: Partial<User>) => BaseServices.create<User>(user, '/User'),
  update: (id: string, data: Partial<User>) => BaseServices.update<User>(id, data, '/User'),
  delete: (id: string) => BaseServices.delete(id, '/User'),
  changeStatus: (id: string, isActive: boolean) => BaseServices.update<User>(id, { isActive }, '/User'),
  resetPassword: async (id: string | number, newPassword: string): Promise<BaseResponse<unknown>> => {
    const response = await axiosInstance.post(`/User/${id}/reset-password`, { newPassword });
    return response.data;
  },
  updateUser: async (payload: Partial<User> & { id: string | number }): Promise<BaseResponse<User>> => {
    const { id, ...data } = payload;
    return BaseServices.update<User>(String(id), data, '/User');
  },
  getUserProfile: async (): Promise<BaseResponse<User>> => {
    const response = await axiosInstance.get('/User/me');
    return response.data;
  }
};
