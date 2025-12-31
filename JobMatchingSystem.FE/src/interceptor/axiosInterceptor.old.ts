import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { JWTUtils } from '@/lib/utils/jwtUtils';
import { getStore } from '@/store';
import { logout } from '@/store/slices/authSlice';

import { API_BASE_URL } from '../../env.ts';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 100000,
    timeoutErrorMessage: "Request timeout",
    headers: {
        Accept: "*/*",
        // "Content-Type": "application/json",
    },
    withCredentials: true,
});

/**
 * Helper: Viết hoa chữ cái đầu tiên của chuỗi
 */
const capitalizeFirst = (str: string): string => {
    if (!str || typeof str !== 'string') return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Transform params để đảm bảo sortBy luôn viết hoa chữ cái đầu
 */
const transformPaginationParams = (params: Record<string, any> | undefined): Record<string, any> | undefined => {
    if (!params) return params;
    
    const transformed = { ...params };
    
    // Transform sortBy nếu có
    if (transformed.sortBy ) {
        transformed.sortBy = capitalizeFirst(transformed.sortBy);
    }
    
    return transformed;
};

// ====== REQUEST INTERCEPTOR ======
axiosInstance.interceptors.request.use(
    function (config) {
        // Thêm token vào header nếu có và token chưa hết hạn
        if (!config.headers.Authorization) {
            const accessToken = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (accessToken) {
                // Kiểm tra token expiration trước khi gửi request
                if (JWTUtils.isTokenExpired(accessToken)) {
                    // Token đã hết hạn - clear storage và logout ngay lập tức
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('role');
                    Cookies.remove('accessToken');
                    Cookies.remove('role');
                    // Dispatch logout action để reset Redux state
                    const store = getStore();
                    store.dispatch(logout());
                    // Không thêm token vào header - request sẽ nhận 401 từ server
                    // Response interceptor sẽ xử lý 401
                } else {
                    config.headers.Authorization = `Bearer ${accessToken}`;
                }
            }
        }

        // Transform params để đảm bảo sortBy luôn viết hoa chữ cái đầu
        if (config.params) {
            config.params = transformPaginationParams(config.params);
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
        // Xử lý lỗi 401 (Unauthorized) - Token hết hạn hoặc không hợp lệ
        if (error.response?.status === 401) {
            // Clear storage
            localStorage.removeItem('accessToken');
            localStorage.removeItem('role');
            Cookies.remove('accessToken');
            Cookies.remove('role');
            
            // Dispatch logout action để reset Redux state
            const store = getStore();
            store.dispatch(logout());
            
            // Redirect về trang chủ nếu đang ở protected route
            // Sử dụng window.location để tránh circular dependency với react-router
            if (window.location.pathname.startsWith('/admin') || 
                window.location.pathname.startsWith('/recruiter') ||
                window.location.pathname.startsWith('/candidate') ||
                window.location.pathname.startsWith('/hiringmanager')) {
                window.location.href = '/';
            }
            
            return Promise.reject(error);
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
