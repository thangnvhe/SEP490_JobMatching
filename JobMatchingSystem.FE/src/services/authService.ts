// import axiosInstance from '@/interceptor/axiosInterceptor';
// import type { 
//   LoginRequest, 
//   LoginResponse,
//   RegisterRequest, 
//   ForgotPasswordRequest,
//   ResetPasswordRequest,
//   User,
//   APIResponse 
// } from '@/models';
// import { TokenStorage } from '@/utils/tokenStorage';
// import { JWTUtils } from '@/utils/jwtUtils';

// class AuthService {
//   private readonly baseUrl = '/auth';

//   /**
//    * Đăng nhập người dùng
//    */
//   async login(loginData: LoginRequest): Promise<APIResponse<LoginResponse>> {
//     try {
//       const response = await axiosInstance.post(`${this.baseUrl}/login`, {
//         email: loginData.username, // Backend expects 'email' field
//         passWord: loginData.password // Backend expects 'passWord' field (capital W)
//       });

//       const result = response.data as APIResponse<LoginResponse>;
      
//       if (result.isSuccess && result.result?.token) {
//         // Lưu token vào storage
//         TokenStorage.setAccessToken(result.result.token, loginData.rememberMe || false);
        
//         // Extract user info from token
//         const userInfo = JWTUtils.getUserFromToken(result.result.token);
//         if (userInfo) {
//           TokenStorage.setUser(userInfo, loginData.rememberMe || false);
//         }
//       }

//       return result;
//     } catch (error: any) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Đăng ký người dùng mới
//    */
//   async register(registerData: RegisterRequest): Promise<APIResponse<LoginResponse>> {
//     try {
//       const response = await axiosInstance.post(`${this.baseUrl}/register`, registerData);
      
//       const result = response.data as APIResponse<LoginResponse>;
      
//       if (result.isSuccess && result.result?.token) {
//         // Lưu token vào storage sau khi đăng ký thành công
//         TokenStorage.setAccessToken(result.result.token);
        
//         // Extract user info from token
//         const userInfo = JWTUtils.getUserFromToken(result.result.token);
//         if (userInfo) {
//           TokenStorage.setUser(userInfo);
//         }
//       }

//       return result;
//     } catch (error: any) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Đăng xuất người dùng
//    */
//   async logout(): Promise<APIResponse<string>> {
//     try {
//       const token = TokenStorage.getAccessToken();
      
//       if (token) {
//         // Call logout API
//         const response = await axiosInstance.post(`${this.baseUrl}/logout`);
//         const result = response.data as APIResponse<string>;
        
//         // Clear storage regardless of API response
//         TokenStorage.clearAll();
        
//         return result;
//       }

//       // If no token, just clear storage
//       TokenStorage.clearAll();
      
//       return {
//         isSuccess: true,
//         statusCode: 200,
//         result: 'Đăng xuất thành công'
//       };
//     } catch (error: any) {
//       // Vẫn xóa token khỏi storage ngay cả khi API call thất bại
//       TokenStorage.clearAll();
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Refresh access token
//    */
//   async refreshToken(): Promise<APIResponse<LoginResponse>> {
//     try {
//       const response = await axiosInstance.post(`${this.baseUrl}/refresh-token`);
      
//       const result = response.data as APIResponse<LoginResponse>;
      
//       if (result.isSuccess && result.result?.token) {
//         // Cập nhật token trong storage
//         const isRemembered = !!localStorage.getItem('accessToken');
//         TokenStorage.setAccessToken(result.result.token, isRemembered);
        
//         // Update user info
//         const userInfo = JWTUtils.getUserFromToken(result.result.token);
//         if (userInfo) {
//           TokenStorage.setUser(userInfo, isRemembered);
//         }
//       }

//       return result;
//     } catch (error: any) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Quên mật khẩu
//    */
//   async forgotPassword(forgotPasswordData: ForgotPasswordRequest): Promise<APIResponse<null>> {
//     try {
//       const response = await axiosInstance.post(`${this.baseUrl}/forgot-password`, forgotPasswordData);
//       return response.data;
//     } catch (error: any) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Đặt lại mật khẩu
//    */
//   async resetPassword(resetPasswordData: ResetPasswordRequest): Promise<APIResponse<null>> {
//     try {
//       const response = await axiosInstance.post(`${this.baseUrl}/reset-password`, resetPasswordData);
//       return response.data;
//     } catch (error: any) {
//       throw this.handleError(error);
//     }
//   }

//   /**
//    * Lấy thông tin người dùng hiện tại
//    */
//   async getCurrentUser(): Promise<User | null> {
//     try {
//       const token = TokenStorage.getAccessToken();
//       if (!token) return null;

//       // Try to get user from token first
//       const userFromToken = JWTUtils.getUserFromToken(token);
//       if (userFromToken) {
//         return userFromToken as User;
//       }

//       // If needed, call API to get full user info
//       // const response = await axiosInstance.get(`${this.baseUrl}/me`);
//       // return response.data.result;
      
//       return null;
//     } catch (error: any) {
//       console.error('Error getting current user:', error);
//       return null;
//     }
//   }

//   /**
//    * Kiểm tra trạng thái đăng nhập
//    */
//   isAuthenticated(): boolean {
//     return TokenStorage.isAuthenticated();
//   }

//   /**
//    * Lấy access token hiện tại
//    */
//   getAccessToken(): string | null {
//     return TokenStorage.getAccessToken();
//   }

//   /**
//    * Lấy user hiện tại từ storage
//    */
//   getCurrentUserFromStorage(): User | null {
//     return TokenStorage.getUser();
//   }

//   /**
//    * Xử lý lỗi API
//    */
//   private handleError(error: any): Error {
//     if (error.response) {
//       // Server trả về lỗi
//       const message = error.response.data?.message || 'Có lỗi xảy ra';
//       const status = error.response.status;
//       const errors = error.response.data?.errors || [];
      
//       const apiError = new Error(message) as any;
//       apiError.status = status;
//       apiError.errors = errors;
      
//       return apiError;
//     } else if (error.request) {
//       // Network error
//       return new Error('Không thể kết nối đến server');
//     } else {
//       // Other error
//       return new Error(error.message || 'Có lỗi xảy ra');
//     }
//   }
// }

// export const authService = new AuthService();