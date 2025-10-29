import type { User } from '@/models/user';
import { BaseServices } from './base.service';
import axiosInstance from "@/interceptor/axiosInterceptor.old";
import type { BaseResponse } from "@/models/base";

export const UserServices = {
  getAll: (params?: any) => BaseServices.getAll<User[]>('/users', params),
  getById: (id: string) => BaseServices.getById<User>(id, '/users'),
  create: (user: Partial<User>) => BaseServices.create<User>(user, '/users'),
  update: (id: string, data: Partial<User>) => BaseServices.update<User>(id, data, '/users'),
  delete: (id: string) => BaseServices.delete(id, '/users'),
  changeStatus: (id: string, isActive: boolean) => BaseServices.update<User>(id, { isActive }, '/users'),
  getUserProfile: async (): Promise<BaseResponse<User>> => {
    const response = await axiosInstance.get('/User/me');
    return response.data;
  }
};
