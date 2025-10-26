import axiosInstance from '@/interceptor/axiosInterceptor';
import type { ApiResponse, User } from './types';

class UserService {
  private readonly baseUrl = '/users';

  /**
   * Lấy danh sách người dùng
   */
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<{
    users: User[];
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
   * Lấy thông tin người dùng theo ID
   */
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.get(`${this.baseUrl}/${userId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Cập nhật thông tin người dùng
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.put(`${this.baseUrl}/${userId}`, userData);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Xóa người dùng
   */
  async deleteUser(userId: string): Promise<ApiResponse<null>> {
    try {
      const response = await axiosInstance.delete(`${this.baseUrl}/${userId}`);
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Thay đổi trạng thái người dùng
   */
  async changeUserStatus(userId: string, isActive: boolean): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.patch(`${this.baseUrl}/${userId}/status`, { isActive });
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

export const userService = new UserService();
