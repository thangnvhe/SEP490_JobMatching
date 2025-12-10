
import { BaseApiServices } from "./base-api.service";
import { BaseResponse, PaginationParamsInput } from "@/models/base";
import { Order } from "@/models/order";

export const OrderServices = {
    createOrder: (serviceId: number) =>
        BaseApiServices.custom<BaseResponse<any>>('post', '/Order', { serviceId }),
    getAllWithPagination: (params: PaginationParamsInput) =>
        BaseApiServices.getAllWithPagination<Order[]>('/Order/paged', params),
};