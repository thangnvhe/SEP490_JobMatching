import axiosInstance from '@/interceptor/axiosInterceptor';
import type { ApiResponse, Job } from './types';

class JobService {
  private readonly baseUrl = '/jobs';

  /**
   * Lấy danh sách công việc
   */
  async getJobs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    location?: string;
    jobType?: string;
    salaryMin?: number;
    salaryMax?: number;
    companyId?: string;
    status?: string;
  }): Promise<ApiResponse<{
    jobs: Job[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const response = await axiosInstance.get(this.baseUrl, { params });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Lấy thông tin công việc theo ID
   */
  async getJobById(jobId: string): Promise<ApiResponse<Job>> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${jobId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Tạo công việc mới
   */
  async createJob(jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    try {
      const response = await axiosInstance.post(this.baseUrl, jobData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Cập nhật công việc
   */
  async updateJob(jobId: string, jobData: Partial<Job>): Promise<ApiResponse<Job>> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/${jobId}`, jobData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Xóa công việc
   */
  async deleteJob(jobId: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/${jobId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Ứng tuyển công việc
   */
  async applyJob(jobId: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/${jobId}/apply`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Lưu công việc yêu thích
   */
  async saveJob(jobId: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.post(`${this.baseUrl}/${jobId}/save`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Bỏ lưu công việc
   */
  async unsaveJob(jobId: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/${jobId}/save`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Lấy danh sách công việc đã lưu
   */
  async getSavedJobs(): Promise<ApiResponse<Job[]>> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/saved`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Xử lý lỗi API
   */
  private handleError(error: any): Error {
    if (error.response) {
      const message = error.response.data?.message || 'Có lỗi xảy ra';
      const status = error.response.status;
      const errors = error.response.data?.errors || [];
      
      const apiError = new Error(message) as any;
      apiError.status = status;
      apiError.errors = errors;
      
      return apiError;
    } else if (error.request) {
      return new Error('Không thể kết nối đến server');
    } else {
      return new Error(error.message || 'Có lỗi xảy ra');
    }
  }
}

export const jobService = new JobService();
