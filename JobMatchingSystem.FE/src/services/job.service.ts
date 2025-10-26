import type { Job } from "@/models/job";
import { BaseServices } from "./base.service";

export const JobServices = {
  getAll: (params: any) => BaseServices.getAll<Job[]>('/jobs', params),
  getAllWithPagination: (params: any) => BaseServices.getAllWithPagination<Job[]>('/jobs', params),
  getById: (id: string) => BaseServices.getById<Job>(id, '/jobs'),
  create: (job: Job) => BaseServices.create<Job>(job, '/jobs'),
  update: (id: string, job: Job) => BaseServices.update<Job>(id, job, '/jobs'),
  delete: (id: string) => BaseServices.delete(id, '/jobs')

  // Sample call API
  // sampleCallAPI: async (params: PaginationParamsInput): Promise<ShipperDeliveriesResponse> => {
  //   const response = await axiosInstance.get('/shipper/orders', { params });
  //   return response.data;
  // },
};