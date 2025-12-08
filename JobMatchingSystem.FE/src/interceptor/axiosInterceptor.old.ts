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
