import axios, { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { TokenStorage } from '@/utils/tokenStorage';
import { authService } from '@/services/authService';

// Cấu hình API base URL - bạn có thể thay đổi theo môi trường
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://localhost:7044/api";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    timeoutErrorMessage: 'Request timeout',
    headers: {
        'Accept': '*/*',
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Flag để tránh refresh token nhiều lần đồng thời
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Hàm thêm các request vào hàng đợi khi đang refresh token
const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

// Hàm thông báo cho tất cả request đang chờ về token mới
const notifyRefreshSubscribers = (token: string) => {
    refreshSubscribers.forEach((callback) => callback(token));
    refreshSubscribers = [];
};

// Request interceptor - Thêm token vào header
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = TokenStorage.getAccessToken();
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request (chỉ trong development)
        if (import.meta.env.DEV) {
            console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`, {
                params: config.params,
                data: config.data,
            });
        }

        return config;
    },
    (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor - Xử lý refresh token và errors
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log response (chỉ trong development)
        if (import.meta.env.DEV) {
            console.log(`✅ Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data: response.data,
            });
        }

        return response;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Log error (chỉ trong development)
        if (import.meta.env.DEV) {
            console.error(`❌ Response Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`, {
                status: error.response?.status,
                data: error.response?.data,
            });
        }

        // Nếu token hết hạn (401) và chưa retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Nếu đang refresh token, thêm request vào hàng đợi
                return new Promise((resolve) => {
                    addRefreshSubscriber((token: string) => {
                        if (originalRequest.headers) {
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                        }
                        resolve(axiosInstance(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Gọi refresh token
                const response = await authService.refreshToken();
                
                if (response.isSuccess && response.result?.token) {
                    const newToken = response.result.token;
                    
                    // Cập nhật token trong request hiện tại
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }

                    // Thông báo cho các request đang chờ
                    notifyRefreshSubscribers(newToken);

                    // Retry request gốc
                    return axiosInstance(originalRequest);
                } else {
                    throw new Error('Refresh token failed');
                }
            } catch (refreshError) {
                // Refresh token thất bại, clear storage và redirect to login
                TokenStorage.clearAll();
                
                // Có thể dispatch logout action hoặc redirect
                window.location.href = '/login';
                
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Xử lý các lỗi khác
        let errorMessage = 'Có lỗi xảy ra';
        let errorCode = error.response?.status || 500;

        if (error.response?.data) {
            const errorData = error.response.data as any;
            errorMessage = errorData.message || errorData.title || errorMessage;
        } else if (error.request) {
            errorMessage = 'Không thể kết nối đến server';
            errorCode = 0;
        } else {
            errorMessage = error.message || errorMessage;
        }

        // Tạo error object với thông tin chi tiết
        const apiError = new Error(errorMessage) as any;
        apiError.status = errorCode;
        apiError.response = error.response;
        apiError.request = error.request;

        return Promise.reject(apiError);
    }
);

export default axiosInstance;