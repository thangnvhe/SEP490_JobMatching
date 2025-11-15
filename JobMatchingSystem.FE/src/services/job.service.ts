import type { JobDetailResponse, JobSearchParams } from "@/models/job";
import { BaseServices } from "./base.service";
import type { BaseResponse, PaginatedResponse } from "@/models/base";



export const JobServices = {
  // Lấy danh sách công việc với filter
  searchJobs: async (params: JobSearchParams): Promise<BaseResponse<JobDetailResponse[]>> => {
    try {
      const response = await BaseServices.getAll<JobDetailResponse[]>(params, '/job');
      return response;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  },

  // Lấy danh sách công việc với phân trang
  getJobsWithPagination: async (params: JobSearchParams): Promise<PaginatedResponse<JobDetailResponse>> => {
    try {
      const response = await BaseServices.getAllWithPagination<JobDetailResponse>(params, '/job');
      return response;
    } catch (error) {
      console.error('Error fetching jobs with pagination:', error);
      throw error;
    }
  },

  // Lấy chi tiết công việc theo ID
  getJobById: async (jobId: string): Promise<BaseResponse<JobDetailResponse>> => {
    try {
      const response = await BaseServices.getById<JobDetailResponse>(jobId, '/job');
      return response;
    } catch (error) {
      console.error('Error fetching job details:', error);
      throw error;
    }
  },

  // Tạo công việc mới (dành cho Recruiter)
  createJob: (job: any): Promise<BaseResponse<any>> => 
    BaseServices.create<any>(job, '/job'),
  
  // Cập nhật công việc (dành cho Recruiter)  
  updateJob: (id: string, job: any): Promise<BaseResponse<any>> => 
    BaseServices.update<any>(id, job, '/job'),
  
  // Kiểm duyệt công việc (dành cho Admin)
  censorJob: async (jobId: string, censorData: { Status: number }): Promise<BaseResponse<any>> => {
    try {
      // Sử dụng axios trực tiếp cho endpoint đặc biệt này
      const response = await BaseServices.update<any>(jobId, censorData, '/job');
      return response;
    } catch (error) {
      console.error('Error censoring job:', error);
      throw error;
    }
  },

  // Legacy methods for backward compatibility
  getAll: (params: any) => BaseServices.getAll<JobDetailResponse[]>(params, '/job'),
  getAllWithPagination: (params: any) => BaseServices.getAllWithPagination<JobDetailResponse>(params, '/job'),
  getById: (id: string) => BaseServices.getById<JobDetailResponse>(id, '/job'),
  create: (job: JobDetailResponse) => BaseServices.create<JobDetailResponse>(job, '/job'),
  update: (id: string, job: JobDetailResponse) => BaseServices.update<JobDetailResponse>(id, job, '/job'),
  delete: (id: string) => BaseServices.delete(id, '/job')
};