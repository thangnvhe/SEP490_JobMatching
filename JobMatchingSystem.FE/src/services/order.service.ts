
import { BaseApiServices } from "./base-api.service";
import { BaseResponse, PaginationParamsInput } from "@/models/base";
import { Order, OrderFilterParams } from "@/models/order";

export const OrderServices = {
    createOrder: (serviceId: number) =>
        BaseApiServices.custom<BaseResponse<any>>('post', '/Order', { serviceId }),
    getAllWithPagination: (params: PaginationParamsInput) =>
        BaseApiServices.getAllWithPagination<Order[]>('/Order/paged', params),

    getAllForAdmin: (params: OrderFilterParams) =>
        BaseApiServices.getAllWithPagination<Order[]>('/Order/paged', params),

    getOrderForRecruiter: (params: PaginationParamsInput) =>
        BaseApiServices.getAllWithPagination<Order[]>('/Order/me', params),
};