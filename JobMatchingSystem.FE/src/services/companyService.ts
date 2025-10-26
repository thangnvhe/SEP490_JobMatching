import axiosInstance from '@/interceptor/axiosInterceptor';
import type { ApiResponse, Company } from './types';

class CompanyService {
  private readonly baseUrl = '/companies';

  /**
   * Lấy danh sách công ty
   */
  async getCompanies(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<ApiResponse<{
    companies: Company[];
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
   * Lấy thông tin công ty theo ID
   */
  async getCompanyById(companyId: string): Promise<ApiResponse<Company>> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${companyId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Tạo công ty mới
   */
  async createCompany(companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    try {
      const response = await axiosInstance.post(this.baseUrl, companyData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Cập nhật công ty
   */
  async updateCompany(companyId: string, companyData: Partial<Company>): Promise<ApiResponse<Company>> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/${companyId}`, companyData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Xóa công ty
   */
  async deleteCompany(companyId: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/${companyId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Thay đổi trạng thái công ty
   */
  async changeCompanyStatus(companyId: string, status: string): Promise<ApiResponse<Company>> {
    try {
      const response = await axiosInstance.patch(`${this.baseUrl}/${companyId}/status`, { status });
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Lấy danh sách công việc của công ty
   */
  async getCompanyJobs(companyId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<{
    jobs: any[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${companyId}/jobs`, { params });
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

export const companyService = new CompanyService();
