import type { 
  UserLogin,
  User
} from '@/models/user';
import { TokenStorage } from '@/utils/tokenStorage';
import { JWTUtils } from '@/utils/jwtUtils';
import { BaseServices } from './base.service';
import type { BaseResponse } from '@/models/base';

/**
 * Xử lý lỗi API
 */
const handleError = (error: any): Error => {
  if (error.response) {
    // Server trả về lỗi
    const message = error.response.data?.message || 'Có lỗi xảy ra';
    const status = error.response.status;
    const errors = error.response.data?.errors || [];
    
    const apiError = new Error(message) as any;
    apiError.status = status;
    apiError.errors = errors;
    
    return apiError;
  } else if (error.request) {
    // Network error
    return new Error('Không thể kết nối đến server');
  } else {
    // Other error
    return new Error(error.message || 'Có lỗi xảy ra');
  }
};

export const AuthServices = {
  /**
   * Đăng nhập người dùng
   */
  login: async (loginData: UserLogin): Promise<BaseResponse<{ token: string }>> => {
    try {
      // Call login API using BaseServices
      const response = await BaseServices.create<{ token: string }>({
        email: loginData.email,
        passWord: loginData.password // Backend expects 'passWord' with capital W
      }, '/auth/login');

      if (response.isSuccess && response.result?.token) {
        // Lưu token vào localStorage
        TokenStorage.setAccessToken(response.result.token, loginData.rememberMe || false);
        
        // Extract user info from token và lưu vào storage
        const userInfo = JWTUtils.getUserFromToken(response.result.token);
        if (userInfo) {
          TokenStorage.setUser(userInfo, loginData.rememberMe || false);
        }
      }

      return response;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  /**
   * Đăng xuất người dùng
   */
  logout: async (): Promise<BaseResponse<string>> => {
    try {
      const token = TokenStorage.getAccessToken();
      
      if (token) {
        // Call logout API using BaseServices
        const response = await BaseServices.create<string>({}, '/auth/logout');
        
        // Clear storage regardless of API response
        TokenStorage.clearAll();
        
        return response;
      }

      // If no token, just clear storage
      TokenStorage.clearAll();
      
      return {
        isSuccess: true,
        statusCode: 200,
        result: 'Đăng xuất thành công',
        errorMessages: []
      };
    } catch (error: any) {
      // Vẫn xóa token khỏi storage ngay cả khi API call thất bại
      TokenStorage.clearAll();
      throw handleError(error);
    }
  },

  /**
   * Refresh access token
   */
  refreshToken: async (): Promise<BaseResponse<string>> => {
    try {
      const response = await BaseServices.create<string>({}, '/auth/refresh-token');
      
      if (response.isSuccess && response.result) {
        // Cập nhật token trong storage
        const isRemembered = !!localStorage.getItem('accessToken');
        TokenStorage.setAccessToken(response.result, isRemembered);
        
        // Update user info
        const userInfo = JWTUtils.getUserFromToken(response.result);
        if (userInfo) {
          TokenStorage.setUser(userInfo, isRemembered);
        }
      }

      return response;
    } catch (error: any) {
      throw handleError(error);
    }
  },

  /**
   * Lấy thông tin người dùng hiện tại
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = TokenStorage.getAccessToken();
      if (!token) return null;

      // Try to get user from token first
      const userFromToken = JWTUtils.getUserFromToken(token);
      if (userFromToken) {
        return userFromToken as User;
      }

      return null;
    } catch (error: any) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Kiểm tra trạng thái đăng nhập
   */
  isAuthenticated: (): boolean => {
    return TokenStorage.isAuthenticated();
  },

  /**
   * Lấy access token hiện tại
   */
  getAccessToken: (): string | null => {
    return TokenStorage.getAccessToken();
  },

  /**
   * Lấy user hiện tại từ storage
   */
  getCurrentUserFromStorage: (): User | null => {
    return TokenStorage.getUser();
  }
};