import type { Job, SavedJob } from "@/models/job";
import { BaseApiServices } from "./base-api.service";
import type { BaseResponse, PaginationParamsInput } from "@/models/base";

export const JobServices = {
  getAll: (params: Record<string, any>) => BaseApiServices.getAll<Job[]>('/Job', params),
  getAllWithPagination: (params: PaginationParamsInput) => BaseApiServices.getAllWithPagination<Job>('/Job/paged', params),
  getById: (id: string) => BaseApiServices.getById<Job>('/Job', id),
  create: (job: Job) => BaseApiServices.create<Job>('/Job', job),
  update: (id: string, job: Job) => BaseApiServices.update<Job>('/Job', id, job),
  delete: (id: string) => BaseApiServices.delete<Job>('/Job', id),

  // Kiểm duyệt công việc (dành cho Admin)
  censorJob: (jobId: string, censorData: { status: number }) =>
    BaseApiServices.custom<BaseResponse<Job>>('put', `/Job/${jobId}/censor`, censorData),


};