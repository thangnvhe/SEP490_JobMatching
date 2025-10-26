import axios, { AxiosError } from 'axios';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

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

// Hàm refresh token
const refreshAccessToken = async (): Promise<string> => {
    const isLocalStorage = localStorage.getItem('accessToken');
    const oldRefreshToken = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
    
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { 
        refreshToken: oldRefreshToken 
    });
    
    const { accessToken, refreshToken } = response.data.data;

    if (isLocalStorage) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    } else {
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', refreshToken);
    }
    
    return accessToken;
};

// ====== REQUEST INTERCEPTOR ======
axiosInstance.interceptors.request.use(
    function (config) {
        // Thêm token vào header nếu có
        if (!config.headers.Authorization) {
            const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
            }
        }
        return config;
    },
    function (error: AxiosError) {
        return Promise.reject(error);
    }
);

// ====== RESPONSE INTERCEPTOR ======
axiosInstance.interceptors.response.use(
    function (response: AxiosResponse) {
        return response;
    },
    async function (error: AxiosError) {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Xử lý lỗi 401 (Unauthorized) - Token hết hạn
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
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
                const newAccessToken = await refreshAccessToken();
                
                if (newAccessToken) {
                    isRefreshing = false;
                    notifyRefreshSubscribers(newAccessToken);

                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }
                    return axiosInstance(originalRequest);
                } else {
                    throw new Error('Không thể refresh token');
                }
            } catch (refreshError) {
                isRefreshing = false;
                refreshSubscribers = [];
                return Promise.reject(refreshError);
            }
        }

        // Xử lý các lỗi khác (im lặng - không hiển thị toast)
        switch (error.response?.status) {
            case 400:
            case 403:
            case 404:
            case 422:
            case 429:
            case 500:
            case 502:
            case 503:
            default:
                // Im lặng: không hiển thị toast hay redirect
                break;
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
