import type { ServicePlan } from "@/models/service-plan";
import { BaseApiServices } from "./base-api.service";
import { PaginationParamsInput } from "@/models/base";

export const ServicePlanServices = {
  getAll: (params?: Record<string, any>) => BaseApiServices.getAll<ServicePlan[]>('/ServicePlan/all', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<ServicePlan>('/ServicePlan', params),
  getById: (id: string) => BaseApiServices.getById<ServicePlan>('/ServicePlan', id),
  create: (data: Omit<ServicePlan, 'id'>) => BaseApiServices.create<ServicePlan>('/ServicePlan', data),
  update: (id: string, data: Omit<ServicePlan, 'id'>) => BaseApiServices.update<ServicePlan>('/ServicePlan', id, data),
  delete: (id: string) => BaseApiServices.delete<ServicePlan>('/ServicePlan', id),
};