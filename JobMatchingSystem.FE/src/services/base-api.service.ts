import axiosInstance from "@/interceptor/axiosInterceptor.old";
import type { BaseResponse, PaginatedResponse, PaginationParamsInput } from "@/models/base";

export const BaseApiServices = {

    getAll: async <T>(url: string, params?: Record<string, any>): Promise<BaseResponse<T>> => {
        const response = await axiosInstance.get(url, { params });
        return response.data;
    },

    getAllWithPagination: async <T>(url: string, params: PaginationParamsInput): Promise<PaginatedResponse<T>> => {
        const response = await axiosInstance.get(url, { params });
        return response.data;
    },

    getById: async <T>(url: string, id: string | number): Promise<BaseResponse<T>> => {
        const response = await axiosInstance.get(`${url}/${id}`);
        return response.data;
    },

    create: async <T>(url: string, data: Partial<T> | FormData): Promise<BaseResponse<T>> => {
        if (data instanceof FormData) {
            const response = await axiosInstance.post(url, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        }
        const response = await axiosInstance.post(url, data);
        return response.data;
    },

    update: async <T>(url: string, id: string | number, data: Partial<T> | FormData): Promise<BaseResponse<T>> => {
        if (data instanceof FormData) {
            const response = await axiosInstance.put(`${url}/${id}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            return response.data;
        }
        const res = await axiosInstance.put(`${url}/${id}`, data);
        return res.data;
    },

    patch: async <T>(url: string, id: string | number, data: Partial<T>): Promise<BaseResponse<T>> => {
        const res = await axiosInstance.patch(`${url}/${id}`, data);
        return res.data;
    },

    delete: async <T>(url: string, id: string | number): Promise<BaseResponse<T>> => {
        const res = await axiosInstance.delete(`${url}/${id}`);
        return res.data;
    },

    /**
   * Hàm gọi API "tùy chỉnh" dành cho những endpoint không thuộc CRUD chuẩn.
   * Params:
   *  - method: phương thức HTTP ("get" | "post" | "put" | "patch" | "delete")
   *  - url: endpoint API
   *  - data: body gửi đi (chỉ dùng cho POST/PUT/PATCH)
   *  - params: query string (?key=value)
   */
    custom: async <T>(
        method: "get" | "post" | "put" | "patch" | "delete",
        url: string,
        data?: any,
        params?: Record<string, any>
    ): Promise<T> => {
        const response = await axiosInstance({ method, url, data, params, });
        return response.data;
    },

};
