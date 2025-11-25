import type { User, CreateHiringManagerRequest } from '@/models/user';
import type { BaseResponse, PaginationParamsInput } from "@/models/base";
import { BaseApiServices } from "./base-api.service";

export const UserServices = {
  getAll: (params?: Record<string, any>) => BaseApiServices.getAll<User[]>('/User', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<User>('/User', params),
  getById: (id: string) => BaseApiServices.getById<User>('/User', id),
  create: (user: Omit<User, 'id'>): Promise<BaseResponse<User>> => BaseApiServices.create<User>('/User', user),
  update: (id: string, data: Partial<User> | FormData) => BaseApiServices.update<User>('/User', id, data),
  delete: (id: string) => BaseApiServices.delete<User>('/User', id),
  changeStatus: (id: string, isActive: boolean) => BaseApiServices.update<User>('/User', id, { isActive }),
  forgotPassword: (email: string) => BaseApiServices.custom("post", "/Auth/forgot-password", { email }),
  resetPassword: (email: string, token: string, newPassword: string, confirmPassword: string) =>
    BaseApiServices.custom("post", "/Auth/reset-password", { email, token, newPassword, confirmPassword }),
  getUserProfile: () => BaseApiServices.custom<User>("get", "/User/me"),
  editUserProfile: (payload: FormData) => BaseApiServices.custom("put", "/User/me", payload),
  verifyEmail: (token: string) => BaseApiServices.custom("get", "/Auth/verify-email", { TokenLink: token }),
  createHiringManager: (payload: CreateHiringManagerRequest) => BaseApiServices.create<User>('/User/hiring-manager', payload)
};
