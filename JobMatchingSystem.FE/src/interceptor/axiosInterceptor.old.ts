import axios, { AxiosError } from 'axios';
import type { AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

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
        // Thêm token vào header nếu có
        if (!config.headers.Authorization) {
            const accessToken = localStorage.getItem('accessToken') || Cookies.get('accessToken');
            if (accessToken) {
                config.headers.Authorization = `Bearer ${accessToken}`;
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
        // Xử lý lỗi 401 (Unauthorized) - Token hết hạn
        if (error.response?.status === 401) {
            // Xóa token và redirect về trang login
            localStorage.removeItem('accessToken');
            Cookies.remove('accessToken');
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
