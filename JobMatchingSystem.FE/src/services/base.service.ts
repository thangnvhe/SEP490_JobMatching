import axiosInstance from "@/interceptor/axiosInterceptor.old";
import type { BaseResponse } from "@/models/base";

export const BaseServices = {
    getAll: async <T>(params: any, url: string): Promise<BaseResponse<T>> => {
        const response = await axiosInstance.get(url, { params });
        return response.data;
    },
    getAllWithPagination: async <T>(params: any, url: string): Promise<BaseResponse<T>> => {
        const response = await axiosInstance.get(url, { params });
        return response.data;
    },
    getById: async <T>(id: string, url: string): Promise<BaseResponse<T>> => {
        const response = await axiosInstance.get(`${url}/${id}`);
        return response.data;
    },
    create: async <T>(data: any, url: string): Promise<BaseResponse<T>> => {
        const response = await axiosInstance.post(url, data);
        return response.data;
    },
    update: async <T>(id: string, data: any, url: string): Promise<BaseResponse<T>> => {
        const response = await axiosInstance.put(`${url}/${id}`, data);
        return response.data;
    },
    delete: async (id: string, url: string): Promise<void> => {
        await axiosInstance.delete(`${url}/${id}`);
    },
    
};